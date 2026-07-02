import type { SupabaseClient } from "@supabase/supabase-js"

import { countAlbums, listRecentAlbumSummaries } from "@/lib/catalog/db/albums"
import { countArtists } from "@/lib/catalog/db/artists"
import type { AlbumSummary } from "@/lib/catalog/types"
import { listUpcomingSessions } from "@/lib/programmation/db/sessions"
import type { ProgrammationSession } from "@/lib/programmation/types"

export type HomeDashboardData = {
  albumCount: number
  artistCount: number
  recentAlbums: AlbumSummary[]
  upcomingSessions: ProgrammationSession[]
}

export async function getHomeDashboardData(
  supabase: SupabaseClient
): Promise<HomeDashboardData> {
  const [albumCount, artistCount, recentAlbums, upcomingSessions] =
    await Promise.all([
      countAlbums(supabase),
      countArtists(supabase),
      listRecentAlbumSummaries(supabase, 6),
      listUpcomingSessions(supabase, 6),
    ])

  return { albumCount, artistCount, recentAlbums, upcomingSessions }
}
