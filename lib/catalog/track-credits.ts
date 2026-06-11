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
  musicbrainz_recording_id?: string | null
  youtube_video_id?: string | null
  video_source?: TrackVideoSource | null
  video_confirmed?: boolean
}

export function mergeImportTracks(
  primary: ImportedTrack[],
  secondary: ImportedTrack[]
) {
  if (primary.length === 0) return secondary
  if (secondary.length === 0) return primary

  return primary.map((track, index) => {
    const byPosition = secondary.find((item) => item.position === track.position)
    const fallback = byPosition ?? secondary[index]

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
      musicbrainz_recording_id:
        fallback?.musicbrainz_recording_id ??
        track.musicbrainz_recording_id ??
        null,
      youtube_video_id:
        videoSource?.youtube_video_id ?? null,
      video_source: videoSource?.video_source ?? null,
      video_confirmed: videoSource?.video_confirmed ?? false,
    }
  })
}
