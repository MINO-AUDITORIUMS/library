import type { SupabaseClient } from "@supabase/supabase-js"

import type { UpdateArtistInput } from "@/lib/catalog/update-artist-input"

function trimBio(value: string, maxLength = 2000) {
  const trimmed = value.trim()
  if (trimmed.length <= maxLength) return trimmed
  return `${trimmed.slice(0, maxLength - 1)}…`
}

export async function updateArtist(
  supabase: SupabaseClient,
  artistId: string,
  input: UpdateArtistInput
) {
  const bio = trimBio(input.bio)

  const { error } = await supabase
    .from("artists")
    .update({
      name: input.name,
      country: input.country || null,
      bio: bio.length > 0 ? bio : null,
    })
    .eq("id", artistId)

  if (error) throw error

  const { error: albumsError } = await supabase
    .from("albums")
    .update({ artist: input.name })
    .eq("artist_id", artistId)

  if (albumsError) throw albumsError

  return artistId
}
