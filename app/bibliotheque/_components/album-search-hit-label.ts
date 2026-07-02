import type { CatalogSearchHit } from "@/lib/catalog/discogs/types"

export function resultArtistLine(hit: CatalogSearchHit) {
  return [hit.artist, hit.subtitle, hit.year].filter(Boolean).join(" · ")
}
