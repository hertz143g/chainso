export type TrackLinkMetadata = {
  url: string;
  platform: string;
  title: string;
  artist: string;
  imageUrl?: string;
  accentColor: string;
};

type PlatformConfig = {
  name: string;
  accentColor: string;
  match: (host: string) => boolean;
  getOembedUrl?: (url: string) => string;
};

const PLATFORM_CONFIGS: PlatformConfig[] = [
  {
    name: "Spotify",
    accentColor: "#1ED760",
    match: (host) => host.includes("spotify.com"),
    getOembedUrl: (url) => `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`,
  },
  {
    name: "Apple Music",
    accentColor: "#FA2D48",
    match: (host) => host.includes("music.apple.com"),
    getOembedUrl: (url) => `https://embed.music.apple.com/oembed?url=${encodeURIComponent(url)}`,
  },
  {
    name: "Яндекс Музыка",
    accentColor: "#FFCC00",
    match: (host) => host.includes("music.yandex.") || host.includes("yandex."),
  },
  {
    name: "YouTube Music",
    accentColor: "#FF0033",
    match: (host) => host.includes("music.youtube.com"),
    getOembedUrl: (url) => `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`,
  },
  {
    name: "YouTube",
    accentColor: "#FF0033",
    match: (host) => host.includes("youtube.com") || host.includes("youtu.be"),
    getOembedUrl: (url) => `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`,
  },
  {
    name: "SoundCloud",
    accentColor: "#FF6A00",
    match: (host) => host.includes("soundcloud.com"),
    getOembedUrl: (url) => `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}`,
  },
  {
    name: "VK Музыка",
    accentColor: "#4C75A3",
    match: (host) => host.includes("vk.com") || host.includes("vk.ru"),
  },
  {
    name: "Deezer",
    accentColor: "#A238FF",
    match: (host) => host.includes("deezer.com"),
  },
  {
    name: "Bandcamp",
    accentColor: "#629AA9",
    match: (host) => host.includes("bandcamp.com"),
    getOembedUrl: (url) => `https://bandcamp.com/oembed?url=${encodeURIComponent(url)}`,
  },
];

function normalizeTrackUrl(input: string) {
  const value = input.trim();
  if (!value) return null;

  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    if (!url.hostname.includes(".")) return null;
    return url;
  } catch {
    return null;
  }
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
    .map((segment) => cleanPathText(decodeURIComponent(segment)))
    .filter(
      (segment) =>
        segment && !ignoredSegments.has(segment.toLowerCase()) && !looksLikeOpaqueId(segment),
    );

  return segments.at(-1) ?? "";
}

function splitTitleAndArtist(title: string, fallbackArtist: string) {
  const separators = [" by ", " — ", " – ", " - "];
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
  const title = pathTitle || `Трек из ${platform.name}`;

  return {
    url: url.toString(),
    platform: platform.name,
    title,
    artist: pathTitle ? platform.name : "Открыть по ссылке",
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

  const split = splitTitleAndArtist(title, artist || fallback.artist);

  if (artist && split.artist.toLowerCase() === artist.toLowerCase()) {
    return {
      title: split.title,
      artist,
    };
  }

  if (artist && title.toLowerCase() !== artist.toLowerCase()) {
    return {
      title,
      artist,
    };
  }

  return split;
}

export async function resolveTrackLink(input: string, signal?: AbortSignal) {
  const fallback = inferTrackFromUrl(input);
  if (!fallback) return null;

  const platform = PLATFORM_CONFIGS.find((config) => config.name === fallback.platform);
  if (!platform?.getOembedUrl) return fallback;

  try {
    const response = await fetch(platform.getOembedUrl(fallback.url), { signal });
    if (!response.ok) return fallback;

    const data = (await response.json()) as {
      title?: unknown;
      author_name?: unknown;
      thumbnail_url?: unknown;
    };
    const parsed = parseOembedTitle(
      typeof data.title === "string" ? data.title : "",
      fallback,
      typeof data.author_name === "string" ? data.author_name : undefined,
    );

    return {
      ...fallback,
      title: parsed.title,
      artist: parsed.artist,
      imageUrl: typeof data.thumbnail_url === "string" ? data.thumbnail_url : undefined,
    };
  } catch {
    return fallback;
  }
}
