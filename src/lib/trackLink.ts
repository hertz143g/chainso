export type TrackLinkMetadata = {
  url: string;
  platform: string;
  title: string;
  artist: string;
  imageUrl?: string;
  accentColor: string;
  resolved?: boolean;
};

type PlatformConfig = {
  name: string;
  accentColor: string;
  match: (host: string) => boolean;
  getOembedUrl?: (url: string) => string;
};

function matchesHost(host: string, domain: string) {
  return host === domain || host.endsWith(`.${domain}`);
}

const PLATFORM_CONFIGS: PlatformConfig[] = [
  {
    name: "Spotify",
    accentColor: "#1ED760",
    match: (host) => matchesHost(host, "spotify.com"),
    getOembedUrl: (url) => `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`,
  },
  {
    name: "Apple Music",
    accentColor: "#FA2D48",
    match: (host) => matchesHost(host, "music.apple.com"),
    getOembedUrl: (url) => `https://embed.music.apple.com/oembed?url=${encodeURIComponent(url)}`,
  },
  {
    name: "Яндекс Музыка",
    accentColor: "#FFCC00",
    match: (host) => ["music.yandex.ru", "music.yandex.com", "music.yandex.kz", "music.yandex.by"].some((domain) => matchesHost(host, domain)),
  },
  {
    name: "YouTube Music",
    accentColor: "#FF0033",
    match: (host) => matchesHost(host, "music.youtube.com"),
    getOembedUrl: (url) => `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`,
  },
  {
    name: "YouTube",
    accentColor: "#FF0033",
    match: (host) => matchesHost(host, "youtube.com") || matchesHost(host, "youtu.be"),
    getOembedUrl: (url) => `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`,
  },
  {
    name: "SoundCloud",
    accentColor: "#FF6A00",
    match: (host) => matchesHost(host, "soundcloud.com"),
    getOembedUrl: (url) => `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}`,
  },
  {
    name: "VK Музыка",
    accentColor: "#4C75A3",
    match: (host) => matchesHost(host, "vk.com") || matchesHost(host, "vk.ru"),
  },
  {
    name: "Deezer",
    accentColor: "#A238FF",
    match: (host) => matchesHost(host, "deezer.com"),
  },
  {
    name: "Bandcamp",
    accentColor: "#629AA9",
    match: (host) => matchesHost(host, "bandcamp.com"),
    getOembedUrl: (url) => `https://bandcamp.com/oembed?url=${encodeURIComponent(url)}`,
  },
];

function normalizeTrackUrl(input: string) {
  const value = input.trim();
  if (!value || value.length > 2048) return null;

  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    if (!["http:", "https:"].includes(url.protocol) || !url.hostname.includes(".")) return null;
    if (url.username || url.password) return null;
    return url;
  } catch {
    return null;
  }
}

function safeDecode(value: string) {
  try { return decodeURIComponent(value); } catch { return value; }
}

function cleanPathText(value: string) {
  return value
    .replace(/\+/g, " ")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanDisplayText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function getPlatform(url: URL) {
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  const config = PLATFORM_CONFIGS.find((platform) => platform.match(host));

  if (config) return config;

  return {
    name: host
      .split(".")
      .filter(Boolean)
      .slice(0, -1)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ") || "Музыка",
    accentColor: "#7C65FF",
    match: () => true,
  } satisfies PlatformConfig;
}

function getTitleFromPath(url: URL) {
  const ignoredSegments = new Set([
    "album",
    "song",
    "single",
    "tr",
    "gb",
    "de",
    "fr",
    "artist",
    "intl",
    "music",
    "playlist",
    "playlists",
    "radio",
    "ru",
    "track",
    "tracks",
    "us",
    "watch",
  ]);
  const looksLikeOpaqueId = (segment: string) =>
    /^\d+$/.test(segment) || (/^[a-z0-9]+$/i.test(segment) && segment.length >= 12);
  const segments = url.pathname
    .split("/")
    .map((segment) => cleanPathText(safeDecode(segment)))
    .filter(
      (segment) =>
        segment && !ignoredSegments.has(segment.toLowerCase()) && !looksLikeOpaqueId(segment),
    );

  // Video IDs and short URLs are identifiers, not song names.
  if (matchesHost(url.hostname, "youtu.be") || matchesHost(url.hostname, "youtube.com") || url.pathname.includes("/track/")) {
    return "";
  }
  return segments.at(-1) ?? "";
}

function splitTitleAndArtist(title: string, fallbackArtist: string) {
  const separators = fallbackArtist ? [" by ", " — ", " – ", " - "] : [" — ", " – ", " - "];
  const separator = separators.find((value) => title.includes(value));

  if (!separator) {
    return {
      title,
      artist: fallbackArtist,
    };
  }

  const [left, ...rightParts] = title.split(separator);
  const right = rightParts.join(separator).trim();

  if (!left.trim() || !right) {
    return {
      title,
      artist: fallbackArtist,
    };
  }

  if (separator.trim() === "by") {
    return {
      title: left.trim(),
      artist: right,
    };
  }

  return {
    title: right,
    artist: left.trim(),
  };
}

export function inferTrackFromUrl(input: string): TrackLinkMetadata | null {
  const url = normalizeTrackUrl(input);
  if (!url) return null;

  const platform = getPlatform(url);
  const pathTitle = getTitleFromPath(url);
  const title = cleanTrackTitle(pathTitle, url.toString());

  return {
    url: url.toString(),
    platform: platform.name,
    title,
    artist: "",
    resolved: false,
    accentColor: platform.accentColor,
  };
}

function parseOembedTitle(rawTitle: string, fallback: TrackLinkMetadata, author?: string) {
  const title = cleanDisplayText(rawTitle);
  const artist = author ? cleanDisplayText(author) : "";

  if (!title) {
    return {
      title: fallback.title,
      artist: artist || fallback.artist,
    };
  }

  if (!artist && fallback.platform === "Spotify") return { title, artist: "" };
  const split = splitTitleAndArtist(title, artist || fallback.artist);

  if (artist) {
    if (split.artist.toLowerCase() === artist.toLowerCase()) return { title: split.title, artist };
    return { title, artist };
  }

  return split;
}

export function getTrackOembedUrl(input: string) {
  const url = normalizeTrackUrl(input);
  if (!url) return null;
  return getPlatform(url).getOembedUrl?.(url.toString()) ?? null;
}

export function cleanTrackTitle(title: string, trackUrl?: string) {
  const text = cleanDisplayText(title);
  const url = trackUrl ? normalizeTrackUrl(trackUrl) : null;
  // Apple album slugs include the release format. It is not part of the song.
  if (url && matchesHost(url.hostname, "music.apple.com") && url.pathname.includes("/album/")) {
    const slug = url.pathname.split("/")[url.pathname.split("/").indexOf("album") + 1] ?? "";
    const matchesSlug = cleanPathText(text).toLowerCase() === cleanPathText(safeDecode(slug)).toLowerCase();
    const suffix = matchesSlug ? /\s+(?:[-–—]\s*)?single$/iu : /\s+[-–—]\s*single$/iu;
    const clean = text.replace(suffix, "").trim();
    return clean || text;
  }
  return text;
}

export function parseTrackOembed(data: { title?: unknown; author_name?: unknown; thumbnail_url?: unknown }, fallback: TrackLinkMetadata): TrackLinkMetadata {
  const rawTitle = typeof data.title === "string" ? data.title : "";
  const parsed = parseOembedTitle(rawTitle, fallback, typeof data.author_name === "string" ? data.author_name : undefined);
  const imageUrl = typeof data.thumbnail_url === "string" && /^https:\/\//i.test(data.thumbnail_url)
    ? data.thumbnail_url : undefined;
  return { ...fallback, title: cleanTrackTitle(parsed.title, fallback.url), artist: parsed.artist, imageUrl, resolved: Boolean(rawTitle.trim()) };
}

export async function resolveTrackLink(input: string, signal?: AbortSignal) {
  const fallback = inferTrackFromUrl(input);
  if (!fallback) return null;
  try {
    const response = await fetch(`/api/music?url=${encodeURIComponent(fallback.url)}`, {
      signal: AbortSignal.any([signal ?? new AbortController().signal, AbortSignal.timeout(9000)]),
    });
    if (!response.ok) return fallback;
    const data = await response.json() as TrackLinkMetadata;
    if (data.url !== fallback.url || typeof data.title !== "string" || typeof data.artist !== "string") return fallback;
    return { ...fallback, ...data };
  } catch {
    return fallback;
  }
}
