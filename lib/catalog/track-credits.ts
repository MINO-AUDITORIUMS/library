import { stripCatalogDisambiguation } from "@/lib/catalog/normalize-artist-name"

export function uniqueCreditNames(names: string[]) {
  const seen = new Set<string>()
  const result: string[] = []

  for (const name of names) {
    const trimmed = stripCatalogDisambiguation(name)
    if (!trimmed) continue
    const key = trimmed.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    result.push(trimmed)
  }

  return result
}

export function normalizeProducersString(value: string) {
  return uniqueCreditNames(
    value.split(",").map((part) => stripCatalogDisambiguation(part))
  ).join(", ")
}

export function isWriterCreditRole(role: string) {
  const normalized = role.trim().toLowerCase()
  return (
    normalized.includes("written") ||
    normalized === "composer" ||
    normalized === "lyricist" ||
    normalized.includes("writer")
  )
}

export function isProducerCreditRole(role: string) {
  const normalized = role.trim().toLowerCase()
  if (normalized.includes("executive")) return false
  return normalized.includes("produc")
}

export function isMusicBrainzWriterRelation(type: string) {
  const normalized = type.trim().toLowerCase()
  return (
    normalized === "writer" ||
    normalized === "composer" ||
    normalized === "lyricist"
  )
}

export function isMusicBrainzProducerRelation(type: string) {
  return type.trim().toLowerCase().includes("producer")
}

export type TrackVideoSource =
  | "discogs"
  | "musicbrainz"
  | "wikidata"
  | "manual"
  | "suggested"

export type ImportedTrack = {
  position: number
  title: string
  duration_seconds: number | null
  writers: string[]
  producers: string[]
  featuring: string[]
  musicbrainz_recording_id?: string | null
  spotify_track_id?: string | null
  youtube_video_id?: string | null
  video_source?: TrackVideoSource | null
  video_confirmed?: boolean
}

export function normalizeTrackTitle(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\(feat\.?[^)]*\)/gi, "")
    .replace(/\(ft\.?[^)]*\)/gi, "")
    .replace(/ - feat\.? .+$/i, "")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
}

function findMatchingSecondaryTrack(
  track: ImportedTrack,
  index: number,
  secondary: ImportedTrack[]
) {
  const byPosition = secondary.find((item) => item.position === track.position)
  if (byPosition) return byPosition

  const normalized = normalizeTrackTitle(track.title)
  if (normalized) {
    const byTitle = secondary.find(
      (item) => normalizeTrackTitle(item.title) === normalized
    )
    if (byTitle) return byTitle
  }

  return secondary[index]
}

export function mergeImportTracks(
  primary: ImportedTrack[],
  secondary: ImportedTrack[]
) {
  if (primary.length === 0) return secondary
  if (secondary.length === 0) return primary

  return primary.map((track, index) => {
    const fallback = findMatchingSecondaryTrack(track, index, secondary)

    const videoSource = fallback?.youtube_video_id
      ? fallback
      : track.youtube_video_id
        ? track
        : null

    return {
      position: track.position,
      title: track.title,
      duration_seconds:
        track.duration_seconds ?? fallback?.duration_seconds ?? null,
      writers: uniqueCreditNames([
        ...(fallback?.writers ?? []),
        ...track.writers,
      ]),
      producers: uniqueCreditNames([
        ...track.producers,
        ...(fallback?.producers ?? []),
      ]),
      featuring: uniqueCreditNames([
        ...track.featuring,
        ...(fallback?.featuring ?? []),
      ]),
      musicbrainz_recording_id:
        fallback?.musicbrainz_recording_id ??
        track.musicbrainz_recording_id ??
        null,
      spotify_track_id:
        track.spotify_track_id ?? fallback?.spotify_track_id ?? null,
      youtube_video_id:
        videoSource?.youtube_video_id ?? null,
      video_source: videoSource?.video_source ?? null,
      video_confirmed: videoSource?.video_confirmed ?? false,
    }
  })
}
