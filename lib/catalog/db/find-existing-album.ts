import type { SupabaseClient } from "@supabase/supabase-js"

export type ExistingAlbumLookupInput = {
  spotifyAlbumId: string | null
  discogsReleaseId: number | null
  musicbrainzReleaseId: string | null
}

async function findByExternalId(
  supabase: SupabaseClient,
  key: "spotify" | "discogs" | "musicbrainz",
  value: string
) {
  const { data, error } = await supabase
    .from("albums")
    .select("id")
    .eq(`external_ids->>${key}`, value)
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return (data?.id as string | undefined) ?? null
}

export async function findExistingAlbumId(
  supabase: SupabaseClient,
  input: ExistingAlbumLookupInput
) {
  const spotifyId = input.spotifyAlbumId?.trim()
  if (spotifyId) {
    const match = await findByExternalId(supabase, "spotify", spotifyId)
    if (match) return match
  }

  if (input.discogsReleaseId && input.discogsReleaseId > 0) {
    const match = await findByExternalId(
      supabase,
      "discogs",
      String(input.discogsReleaseId)
    )
    if (match) return match
  }

  const musicbrainzId = input.musicbrainzReleaseId?.trim()
  if (musicbrainzId) {
    const match = await findByExternalId(supabase, "musicbrainz", musicbrainzId)
    if (match) return match
  }

  return null
}
