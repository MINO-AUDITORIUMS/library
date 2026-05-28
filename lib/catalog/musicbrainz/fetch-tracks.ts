import { musicBrainzFetch } from "@/lib/catalog/musicbrainz/client"
import type { MusicBrainzRelease } from "@/lib/catalog/musicbrainz/types"

export type ImportedTrack = {
  position: number
  title: string
  duration_seconds: number | null
}

export async function fetchMusicBrainzTracks(releaseId: string) {
  const data = await musicBrainzFetch<MusicBrainzRelease>({
    path: `/release/${releaseId}`,
    searchParams: { inc: "recordings+media" },
  })

  const parsed: ImportedTrack[] = []
  let position = 0

  for (const medium of data.media ?? []) {
    for (const track of medium.tracks ?? []) {
      const title = track.title?.trim() || track.recording?.title?.trim()
      if (!title) continue
      position += 1
      const lengthMs = track.length ?? track.recording?.length
      parsed.push({
        position: track.position || position,
        title,
        duration_seconds:
          typeof lengthMs === "number" && lengthMs > 0
            ? Math.round(lengthMs / 1000)
            : null,
      })
    }
  }

  return parsed
}
