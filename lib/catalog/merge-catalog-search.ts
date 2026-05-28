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

function mergeHits(existing: CatalogSearchHit, incoming: CatalogSearchHit) {
  return {
    ...existing,
    discogsMasterId: existing.discogsMasterId ?? incoming.discogsMasterId,
    musicbrainzReleaseGroupId:
      existing.musicbrainzReleaseGroupId ?? incoming.musicbrainzReleaseGroupId,
    thumbUrl: existing.thumbUrl ?? incoming.thumbUrl,
    year: existing.year ?? incoming.year,
    subtitle: [
      "Référence principale",
      existing.discogsMasterId && incoming.musicbrainzReleaseGroupId
        ? "Discogs + MusicBrainz"
        : existing.discogsMasterId
          ? "Discogs"
          : "MusicBrainz",
      existing.year ?? incoming.year ?? "",
    ]
      .filter(Boolean)
      .join(" · "),
    key: `merged:${existing.discogsMasterId ?? "d"}:${incoming.musicbrainzReleaseGroupId ?? existing.musicbrainzReleaseGroupId ?? "m"}`,
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

  return [...merged.values()].slice(0, 12)
}
