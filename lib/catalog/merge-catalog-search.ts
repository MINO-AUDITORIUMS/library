import type { CatalogSearchHit } from "@/lib/catalog/discogs/types"

function normalizeToken(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
}

function albumKey(title: string, artist: string) {
  return `${normalizeToken(artist)}::${normalizeToken(title)}`
}

function sourceLabel(hit: CatalogSearchHit) {
  const sources: string[] = []
  if (hit.spotifyAlbumId) sources.push("Spotify")
  if (hit.discogsMasterId) sources.push("Discogs")
  if (hit.musicbrainzReleaseGroupId) sources.push("MusicBrainz")
  return sources.length > 0 ? sources.join(" + ") : "Catalogue"
}

function mergeHits(existing: CatalogSearchHit, incoming: CatalogSearchHit) {
  const preferIncomingThumb = incoming.spotifyAlbumId && !existing.spotifyAlbumId
  const preferExistingThumb = existing.spotifyAlbumId && !incoming.spotifyAlbumId
  const thumbUrl = preferIncomingThumb
    ? incoming.thumbUrl ?? existing.thumbUrl
    : preferExistingThumb
      ? existing.thumbUrl ?? incoming.thumbUrl
      : existing.thumbUrl ?? incoming.thumbUrl

  const merged = {
    ...existing,
    spotifyAlbumId: existing.spotifyAlbumId ?? incoming.spotifyAlbumId,
    discogsMasterId: existing.discogsMasterId ?? incoming.discogsMasterId,
    musicbrainzReleaseGroupId:
      existing.musicbrainzReleaseGroupId ?? incoming.musicbrainzReleaseGroupId,
    thumbUrl,
    year: existing.year ?? incoming.year,
  }

  return {
    ...merged,
    subtitle: [sourceLabel(merged)].filter(Boolean).join(" · "),
    key: `merged:${merged.spotifyAlbumId ?? "s"}:${merged.discogsMasterId ?? "d"}:${merged.musicbrainzReleaseGroupId ?? "m"}`,
  }
}

export function mergeCatalogSearchResults(hits: CatalogSearchHit[]) {
  const merged = new Map<string, CatalogSearchHit>()

  for (const hit of hits) {
    if (!hit.title.trim()) continue
    const key = albumKey(hit.title, hit.artist)
    const current = merged.get(key)
    if (!current) {
      merged.set(key, hit)
      continue
    }
    merged.set(key, mergeHits(current, hit))
  }

  return [...merged.values()]
    .sort((a, b) => {
      const aSpotify = a.spotifyAlbumId ? 1 : 0
      const bSpotify = b.spotifyAlbumId ? 1 : 0
      return bSpotify - aSpotify
    })
    .slice(0, 12)
}
