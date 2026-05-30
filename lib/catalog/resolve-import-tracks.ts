import { fetchDiscogsTracks } from "@/lib/catalog/discogs/fetch-tracks"
import { fetchMusicBrainzTracks } from "@/lib/catalog/musicbrainz/fetch-tracks"
import { mergeImportTracks } from "@/lib/catalog/track-credits"

export type TrackImportSources = {
  discogsReleaseId?: number | null
  musicbrainzReleaseId?: string | null
}

export async function resolveImportTracks(sources: TrackImportSources) {
  let discogsTracks: Awaited<ReturnType<typeof fetchDiscogsTracks>> = []
  let mbTracks: Awaited<ReturnType<typeof fetchMusicBrainzTracks>> = []

  if (sources.discogsReleaseId) {
    try {
      discogsTracks = await fetchDiscogsTracks(sources.discogsReleaseId)
    } catch {
      discogsTracks = []
    }
  }

  if (sources.musicbrainzReleaseId) {
    try {
      mbTracks = await fetchMusicBrainzTracks(sources.musicbrainzReleaseId)
    } catch {
      mbTracks = []
    }
  }

  if (discogsTracks.length === 0) return mbTracks
  if (mbTracks.length === 0) return discogsTracks

  return mergeImportTracks(discogsTracks, mbTracks)
}
