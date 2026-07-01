import type { SupabaseClient, User } from "@supabase/supabase-js"

import type { EditableTrackInput } from "@/lib/catalog/album-tracks-input"
import {
  persistAlbumTracks,
  type PersistAlbumTracksResult,
} from "@/lib/catalog/persist-album-tracks"
import {
  type ImportedTrack,
  type TrackVideoSource,
  uniqueCreditNames,
} from "@/lib/catalog/track-credits"

export type EditableAlbumTrack = {
  position: number
  title: string
  durationSeconds: number | null
  writers: string[]
  producers: string[]
  featuring: string[]
  youtubeVideoId: string | null
  videoSource: TrackVideoSource | null
  videoConfirmed: boolean
  musicbrainzRecordingId: string | null
}

type AlbumTrackRow = {
  position: number
  title: string
  duration_seconds: number | null
  writers: string[] | null
  producers: string[] | null
  featuring: string[] | null
  youtube_video_id: string | null
  video_source: string | null
  video_confirmed: boolean | null
  musicbrainz_recording_id: string | null
}

const editableTrackSelect =
  "position, title, duration_seconds, writers, producers, featuring, youtube_video_id, video_source, video_confirmed, musicbrainz_recording_id"

async function albumExists(supabase: SupabaseClient, albumId: string) {
  const { data, error } = await supabase
    .from("albums")
    .select("id")
    .eq("id", albumId)
    .maybeSingle()

  if (error) throw error
  return Boolean(data)
}

export async function getEditableAlbumTracks(
  supabase: SupabaseClient,
  albumId: string
): Promise<EditableAlbumTrack[] | null> {
  if (!(await albumExists(supabase, albumId))) return null

  const { data, error } = await supabase
    .from("album_tracks")
    .select(editableTrackSelect)
    .eq("album_id", albumId)
    .order("position", { ascending: true })

  if (error) throw error

  return (data as AlbumTrackRow[]).map((row) => ({
    position: row.position,
    title: row.title,
    durationSeconds: row.duration_seconds,
    writers: uniqueCreditNames(row.writers ?? []),
    producers: uniqueCreditNames(row.producers ?? []),
    featuring: uniqueCreditNames(row.featuring ?? []),
    youtubeVideoId: row.youtube_video_id,
    videoSource: (row.video_source as TrackVideoSource | null) ?? null,
    videoConfirmed: row.video_confirmed ?? false,
    musicbrainzRecordingId: row.musicbrainz_recording_id,
  }))
}

function toImportedTrack(
  track: EditableTrackInput,
  index: number
): ImportedTrack {
  return {
    position: index + 1,
    title: track.title,
    duration_seconds: track.durationSeconds,
    writers: track.writers,
    producers: track.producers,
    featuring: track.featuring,
    musicbrainz_recording_id: track.musicbrainzRecordingId,
    youtube_video_id: track.youtubeVideoId,
    video_source:
      track.videoSource ?? (track.youtubeVideoId ? "manual" : null),
    video_confirmed: track.videoConfirmed && Boolean(track.youtubeVideoId),
  }
}

export async function replaceAlbumTracks(
  supabase: SupabaseClient,
  user: User,
  albumId: string,
  tracks: EditableTrackInput[]
): Promise<PersistAlbumTracksResult | null> {
  if (!(await albumExists(supabase, albumId))) return null

  const result = await persistAlbumTracks(
    supabase,
    albumId,
    tracks.map(toImportedTrack)
  )

  await supabase
    .from("albums")
    .update({ updated_by: user.id })
    .eq("id", albumId)

  return result
}
