import { cleanTrackTitle, getTrackOembedUrl, inferTrackFromUrl, parseTrackOembed, type TrackLinkMetadata } from "@/lib/trackLink";

type AppleResult = {
  kind?: string;
  trackId?: number;
  trackName?: string;
  collectionName?: string;
  artistName?: string;
  artworkUrl100?: string;
};

export function parseAppleResults(results: AppleResult[], fallback: TrackLinkMetadata, trackId?: string): TrackLinkMetadata {
  const songs = results.filter((result) => result.kind === "song");
  // An album link may contain several songs. Do not silently pick the first.
  const song = trackId ? songs.find((result) => String(result.trackId) === trackId) : songs.length === 1 ? songs[0] : undefined;
  if (trackId && !song) return fallback;
  const item = song ?? results[0];
  if (!item) return fallback;
  return {
    ...fallback,
    title: song?.trackName?.trim() || cleanTrackTitle(item.collectionName ?? fallback.title, fallback.url),
    artist: item.artistName?.trim() ?? "",
    imageUrl: item.artworkUrl100?.startsWith("https://") ? item.artworkUrl100.replace(/100x100bb/, "600x600bb") : undefined,
    resolved: Boolean(song?.trackName || item.collectionName),
  };
}

export async function resolveMusicMetadata(input: string, signal?: AbortSignal) {
  const fallback = inferTrackFromUrl(input);
  if (!fallback) return null;
  const url = new URL(fallback.url);
  const requestSignal = AbortSignal.any([signal ?? new AbortController().signal, AbortSignal.timeout(7000)]);
  const options = { signal: requestSignal, next: { revalidate: 86_400 }, redirect: "error" as const };

  if (fallback.platform === "Apple Music") {
    const trackId = url.searchParams.get("i") ?? (url.pathname.includes("/song/") ? url.pathname.split("/").at(-1) : undefined);
    const id = trackId ?? url.pathname.split("/").at(-1);
    if (id && /^\d+$/.test(id)) {
      try {
        const country = url.pathname.split("/")[1];
        const lookup = new URL("https://itunes.apple.com/lookup");
        lookup.searchParams.set("id", id);
        lookup.searchParams.set("entity", "song");
        if (/^[a-z]{2}$/i.test(country)) lookup.searchParams.set("country", country);
        const response = await fetch(lookup, options);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.results) && data.results.length) return parseAppleResults(data.results, fallback, trackId);
        }
      } catch { /* Keep a usable card when a provider is unavailable. */ }
    }
  }

  // Only fixed provider endpoints are fetched, never the user-supplied host.
  const endpoint = getTrackOembedUrl(fallback.url);
  if (!endpoint || requestSignal.aborted) return fallback;
  try {
    const response = await fetch(endpoint, options);
    if (!response.ok) return fallback;
    return parseTrackOembed(await response.json(), fallback);
  } catch {
    return fallback;
  }
}
