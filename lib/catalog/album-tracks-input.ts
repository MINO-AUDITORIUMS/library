import {
  type TrackVideoSource,
  uniqueCreditNames,
} from "@/lib/catalog/track-credits"
import { stripCatalogDisambiguation } from "@/lib/catalog/normalize-artist-name"

export type EditableTrackInput = {
  title: string
  durationSeconds: number | null
  writers: string[]
  producers: string[]
  youtubeVideoId: string | null
  videoSource: TrackVideoSource | null
  videoConfirmed: boolean
  musicbrainzRecordingId: string | null
}

const VIDEO_SOURCES: TrackVideoSource[] = [
  "discogs",
  "musicbrainz",
  "wikidata",
  "manual",
  "suggested",
]

function parseCreditNames(value: unknown): string[] {
  if (Array.isArray(value)) {
    return uniqueCreditNames(
      value.filter((item): item is string => typeof item === "string")
    )
  }
  if (typeof value === "string") {
    return uniqueCreditNames(value.split(","))
  }
  return []
}

function parseDuration(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null
  const rounded = Math.round(value)
  return rounded > 0 ? rounded : null
}

function parseVideoSource(value: unknown): TrackVideoSource | null {
  if (typeof value !== "string") return null
  return VIDEO_SOURCES.includes(value as TrackVideoSource)
    ? (value as TrackVideoSource)
    : null
}

function parseOptionalString(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function parseAlbumTracksInput(
  body: unknown
): EditableTrackInput[] | null {
  if (!body || typeof body !== "object") return null
  const data = body as Record<string, unknown>
  if (!Array.isArray(data.tracks)) return null

  const tracks: EditableTrackInput[] = []

  for (const entry of data.tracks) {
    if (!entry || typeof entry !== "object") return null
    const track = entry as Record<string, unknown>

    const title =
      typeof track.title === "string" ? track.title.trim() : ""
    if (!title) return null

    const youtubeVideoId = parseOptionalString(track.youtubeVideoId)

    tracks.push({
      title: stripCatalogDisambiguation(title) || title,
      durationSeconds: parseDuration(track.durationSeconds),
      writers: parseCreditNames(track.writers),
      producers: parseCreditNames(track.producers),
      youtubeVideoId,
      videoSource: parseVideoSource(track.videoSource),
      videoConfirmed: track.videoConfirmed === true,
      musicbrainzRecordingId: parseOptionalString(track.musicbrainzRecordingId),
    })
  }

  return tracks
}
