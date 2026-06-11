import type { SupabaseClient } from "@supabase/supabase-js"

import {
  discogsIdFromExternalIds,
  musicbrainzIdFromExternalIds,
} from "@/lib/catalog/external-ids"
import {
  persistAlbumTracks,
  type PersistAlbumTracksResult,
} from "@/lib/catalog/persist-album-tracks"
import { resolveImportTracks } from "@/lib/catalog/resolve-import-tracks"

export type SyncAlbumTracksResult = PersistAlbumTracksResult

export class SyncAlbumTracksError extends Error {
  code: "not_found" | "no_sources" | "no_tracks"

  constructor(message: string, code: SyncAlbumTracksError["code"]) {
    super(message)
    this.name = "SyncAlbumTracksError"
    this.code = code
  }
}

export async function syncAlbumTracks(
  supabase: SupabaseClient,
  albumId: string
): Promise<SyncAlbumTracksResult> {
  const { data: album, error } = await supabase
    .from("albums")
    .select("id, external_ids")
    .eq("id", albumId)
    .maybeSingle()

  if (error) throw error
  if (!album) {
    throw new SyncAlbumTracksError("Album introuvable.", "not_found")
  }

  const externalIds = album.external_ids as Record<string, unknown>
  const discogsReleaseId = discogsIdFromExternalIds(externalIds)
  const musicbrainzReleaseId = musicbrainzIdFromExternalIds(externalIds)

  if (!discogsReleaseId && !musicbrainzReleaseId) {
    throw new SyncAlbumTracksError(
      "Aucune source Discogs ou MusicBrainz liée à cet album.",
      "no_sources"
    )
  }

  const tracks = await resolveImportTracks({
    discogsReleaseId,
    musicbrainzReleaseId,
  })

  if (tracks.length === 0) {
    throw new SyncAlbumTracksError(
      "Aucune piste trouvée sur Discogs ou MusicBrainz.",
      "no_tracks"
    )
  }

  return persistAlbumTracks(supabase, albumId, tracks)
}
