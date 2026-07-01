import type { SupabaseClient } from "@supabase/supabase-js"

import type { ImportedTrack } from "@/lib/catalog/track-credits"

export type PersistAlbumTracksResult = {
  trackCount: number
  tracksWithWriters: number
  tracksWithProducers: number
  tracksWithVideos: number
}

function trackHasYouTubeVideo(track: ImportedTrack) {
  return Boolean(track.youtube_video_id && track.video_confirmed !== false)
}

function toTrackRow(albumId: string, track: ImportedTrack) {
  return {
    album_id: albumId,
    position: track.position,
    title: track.title,
    duration_seconds: track.duration_seconds,
    writers: track.writers,
    producers: track.producers,
    featuring: track.featuring,
    musicbrainz_recording_id: track.musicbrainz_recording_id ?? null,
    spotify_track_id: track.spotify_track_id ?? null,
    youtube_video_id: track.youtube_video_id ?? null,
    video_source: track.video_source ?? null,
    video_confirmed: trackHasYouTubeVideo(track),
  }
}

export async function persistAlbumTracks(
  supabase: SupabaseClient,
  albumId: string,
  tracks: ImportedTrack[]
): Promise<PersistAlbumTracksResult> {
  const { error: deleteError } = await supabase
    .from("album_tracks")
    .delete()
    .eq("album_id", albumId)

  if (deleteError) throw deleteError

  if (tracks.length > 0) {
    const { error: insertError } = await supabase
      .from("album_tracks")
      .insert(tracks.map((track) => toTrackRow(albumId, track)))

    if (insertError) throw insertError
  }

  const totalDuration = tracks.reduce(
    (sum, track) => sum + (track.duration_seconds ?? 0),
    0
  )
  const tracksWithVideos = tracks.filter(trackHasYouTubeVideo).length

  const { error: updateError } = await supabase
    .from("albums")
    .update({
      track_count: tracks.length,
      total_duration_seconds: totalDuration > 0 ? totalDuration : null,
      official_videos_count: tracksWithVideos,
    })
    .eq("id", albumId)

  if (updateError) throw updateError

  return {
    trackCount: tracks.length,
    tracksWithWriters: tracks.filter((track) => track.writers.length > 0).length,
    tracksWithProducers: tracks.filter((track) => track.producers.length > 0)
      .length,
    tracksWithVideos,
  }
}
