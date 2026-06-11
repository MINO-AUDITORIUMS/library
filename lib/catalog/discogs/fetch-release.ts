import { discogsFetch } from "@/lib/catalog/discogs/client"
import { parseDiscogsDuration } from "@/lib/catalog/discogs/parse-duration"
import {
  type ImportedTrack,
  isProducerCreditRole,
  isWriterCreditRole,
  uniqueCreditNames,
} from "@/lib/catalog/track-credits"
import { parseYouTubeVideoId } from "@/lib/catalog/youtube"

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

type RawDiscogsVideo = {
  title?: string
  uri?: string
  duration?: number
}

type RawDiscogsRelease = {
  tracklist?: RawDiscogsTrack[]
  videos?: RawDiscogsVideo[]
}

export type DiscogsReleaseVideo = {
  title: string
  uri: string
  duration: number | null
  youtubeVideoId: string
}

export type DiscogsReleaseData = {
  tracks: ImportedTrack[]
  videos: DiscogsReleaseVideo[]
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

export function parseDiscogsReleaseData(data: RawDiscogsRelease): DiscogsReleaseData {
  const tracks: ImportedTrack[] = []
  let index = 0

  for (const track of data.tracklist ?? []) {
    const title = track.title?.trim()
    if (!title || title.toLowerCase() === "video") continue

    index += 1
    const position = Number.parseInt(track.position ?? "", 10)
    const credits = extractTrackCredits(track.extraartists)

    tracks.push({
      position: Number.isFinite(position) ? position : index,
      title,
      duration_seconds: parseDiscogsDuration(track.duration),
      writers: credits.writers,
      producers: credits.producers,
    })
  }

  const videos: DiscogsReleaseVideo[] = []

  for (const video of data.videos ?? []) {
    const title = video.title?.trim()
    const uri = video.uri?.trim()
    if (!title || !uri) continue

    const youtubeVideoId = parseYouTubeVideoId(uri)
    if (!youtubeVideoId) continue

    videos.push({
      title,
      uri,
      duration:
        typeof video.duration === "number" && video.duration > 0
          ? video.duration
          : null,
      youtubeVideoId,
    })
  }

  return { tracks, videos }
}

export async function fetchDiscogsReleaseData(
  releaseId: number
): Promise<DiscogsReleaseData> {
  const data = await discogsFetch<RawDiscogsRelease>({
    path: `/releases/${releaseId}`,
  })

  return parseDiscogsReleaseData(data)
}
