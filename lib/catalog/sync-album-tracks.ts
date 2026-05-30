import type { SupabaseClient } from "@supabase/supabase-js"

import {
  discogsIdFromExternalIds,
  musicbrainzIdFromExternalIds,
} from "@/lib/catalog/external-ids"
import { resolveImportTracks } from "@/lib/catalog/resolve-import-tracks"

export type SyncAlbumTracksResult = {
  trackCount: number
  tracksWithWriters: number
  tracksWithProducers: number
}

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

  const { error: deleteError } = await supabase
    .from("album_tracks")
    .delete()
    .eq("album_id", albumId)

  if (deleteError) throw deleteError

  const { error: insertError } = await supabase.from("album_tracks").insert(
    tracks.map((track) => ({
      album_id: albumId,
      position: track.position,
      title: track.title,
      duration_seconds: track.duration_seconds,
      writers: track.writers,
      producers: track.producers,
    }))
  )

  if (insertError) throw insertError

  const totalDuration = tracks.reduce(
    (sum, track) => sum + (track.duration_seconds ?? 0),
    0
  )

  const { error: updateError } = await supabase
    .from("albums")
    .update({
      track_count: tracks.length,
      total_duration_seconds: totalDuration > 0 ? totalDuration : null,
    })
    .eq("id", albumId)

  if (updateError) throw updateError

  return {
    trackCount: tracks.length,
    tracksWithWriters: tracks.filter((track) => track.writers.length > 0).length,
    tracksWithProducers: tracks.filter((track) => track.producers.length > 0)
      .length,
  }
}
