import type { SupabaseClient } from "@supabase/supabase-js"

import { countAlbums, listRecentAlbumSummaries } from "@/lib/catalog/db/albums"
import { countArtists } from "@/lib/catalog/db/artists"
import type { AlbumSummary } from "@/lib/catalog/types"

export type HomeDashboardData = {
  albumCount: number
  artistCount: number
  recentAlbums: AlbumSummary[]
}

export async function getHomeDashboardData(
  supabase: SupabaseClient
): Promise<HomeDashboardData> {
  const [albumCount, artistCount, recentAlbums] = await Promise.all([
    countAlbums(supabase),
    countArtists(supabase),
    listRecentAlbumSummaries(supabase, 6),
  ])

  return { albumCount, artistCount, recentAlbums }
}
