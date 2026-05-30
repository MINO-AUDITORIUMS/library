import type { SupabaseClient } from "@supabase/supabase-js"

import {
  mapArtistDetail,
  type ArtistRow,
} from "@/lib/catalog/db/artists"
import {
  listAlbumSummariesByArtistId,
} from "@/lib/catalog/db/albums"

const artistSelect = `
  id,
  name,
  slug,
  bio,
  image_url,
  country,
  external_ids,
  created_at
`

export async function getArtistDetailById(
  supabase: SupabaseClient,
  artistId: string
) {
  const { data: artist, error: artistError } = await supabase
    .from("artists")
    .select(artistSelect)
    .eq("id", artistId)
    .maybeSingle()

  if (artistError) throw artistError
  if (!artist) return null

  const albums = await listAlbumSummariesByArtistId(supabase, artistId)
  return mapArtistDetail(artist as ArtistRow, albums)
}
