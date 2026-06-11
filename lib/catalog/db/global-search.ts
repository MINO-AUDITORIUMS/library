import type { SupabaseClient } from "@supabase/supabase-js"

import { searchAlbumSummaries } from "@/lib/catalog/db/albums"
import {
  searchArtistsByLabel,
  searchArtistSummaries,
} from "@/lib/catalog/db/artists"
import type { AlbumSummary, ArtistSummary } from "@/lib/catalog/types"

export type GlobalSearchResults = {
  artists: ArtistSummary[]
  albums: AlbumSummary[]
}

function mergeArtistResults(
  byName: ArtistSummary[],
  byLabel: ArtistSummary[],
  limit: number
) {
  const seen = new Set<string>()
  const merged: ArtistSummary[] = []

  for (const artist of [...byName, ...byLabel]) {
    if (seen.has(artist.id)) continue
    seen.add(artist.id)
    merged.push(artist)
    if (merged.length >= limit) break
  }

  return merged
}

export async function runGlobalSearch(
  supabase: SupabaseClient,
  query: string
): Promise<GlobalSearchResults> {
  const [artistsByName, artistsByLabel, albums] = await Promise.all([
    searchArtistSummaries(supabase, query, 5),
    searchArtistsByLabel(supabase, query, 5),
    searchAlbumSummaries(supabase, query, 8),
  ])

  return {
    artists: mergeArtistResults(artistsByName, artistsByLabel, 8),
    albums,
  }
}
