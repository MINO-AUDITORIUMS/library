import { discogsFetch } from "@/lib/catalog/discogs/client"
import { parseDiscogsDuration } from "@/lib/catalog/discogs/parse-duration"
import {
  type ImportedTrack,
  isProducerCreditRole,
  isWriterCreditRole,
  uniqueCreditNames,
} from "@/lib/catalog/track-credits"

type RawDiscogsExtraArtist = {
  name?: string
  role?: string
}

type RawDiscogsTrack = {
  position?: string
  title?: string
  duration?: string
  extraartists?: RawDiscogsExtraArtist[]
}

function extractTrackCredits(extraartists: RawDiscogsExtraArtist[] | undefined) {
  const writers: string[] = []
  const producers: string[] = []

  for (const credit of extraartists ?? []) {
    const name = credit.name?.trim()
    const role = credit.role?.trim() ?? ""
    if (!name || !role) continue

    if (isWriterCreditRole(role)) {
      writers.push(name)
      continue
    }

    if (isProducerCreditRole(role)) {
      producers.push(name)
    }
  }

  return {
    writers: uniqueCreditNames(writers),
    producers: uniqueCreditNames(producers),
  }
}

export async function fetchDiscogsTracks(releaseId: number) {
  const data = await discogsFetch<{ tracklist?: RawDiscogsTrack[] }>({
    path: `/releases/${releaseId}`,
  })

  const parsed: ImportedTrack[] = []
  let index = 0

  for (const track of data.tracklist ?? []) {
    const title = track.title?.trim()
    if (!title || title.toLowerCase() === "video") continue

    index += 1
    const position = Number.parseInt(track.position ?? "", 10)
    const credits = extractTrackCredits(track.extraartists)

    parsed.push({
      position: Number.isFinite(position) ? position : index,
      title,
      duration_seconds: parseDiscogsDuration(track.duration),
      writers: credits.writers,
      producers: credits.producers,
    })
  }

  return parsed
}

export type { ImportedTrack }
