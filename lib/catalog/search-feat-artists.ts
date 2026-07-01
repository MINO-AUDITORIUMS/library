import type { SupabaseClient } from "@supabase/supabase-js"

import { searchArtistSummaries } from "@/lib/catalog/db/artists"
import type { FeatArtistSearchHit } from "@/lib/catalog/feat-artist-search-hit"
import { stripCatalogDisambiguation } from "@/lib/catalog/normalize-artist-name"
import { searchSpotifyArtists } from "@/lib/catalog/spotify/search-artists"

export type { FeatArtistSearchHit } from "@/lib/catalog/feat-artist-search-hit"

function nameKey(name: string) {
  return stripCatalogDisambiguation(name).toLowerCase()
}

export async function searchFeatArtists(
  supabase: SupabaseClient,
  query: string,
  limit = 8
): Promise<FeatArtistSearchHit[]> {
  const trimmed = query.trim()
  if (trimmed.length < 2) return []

  const [library, spotify] = await Promise.all([
    searchArtistSummaries(supabase, trimmed, 5),
    searchSpotifyArtists(trimmed).catch(() => []),
  ])

  const seen = new Set<string>()
  const results: FeatArtistSearchHit[] = []

  for (const artist of library) {
    const key = nameKey(artist.name)
    if (seen.has(key)) continue
    seen.add(key)
    results.push({
      key: `library:${artist.id}`,
      name: artist.name,
      source: "library",
      imageUrl: artist.imageUrl,
    })
    if (results.length >= limit) return results
  }

  for (const artist of spotify) {
    const key = nameKey(artist.name)
    if (seen.has(key)) continue
    seen.add(key)
    results.push(artist)
    if (results.length >= limit) break
  }

  return results
}
