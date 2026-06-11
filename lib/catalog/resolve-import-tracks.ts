import { fetchDiscogsReleaseData } from "@/lib/catalog/discogs/fetch-release"
import { fetchMusicBrainzTracks } from "@/lib/catalog/musicbrainz/fetch-tracks"
import { matchDiscogsVideosToTracks } from "@/lib/catalog/match-track-videos"
import { mergeImportTracks } from "@/lib/catalog/track-credits"

export type TrackImportSources = {
  discogsReleaseId?: number | null
  musicbrainzReleaseId?: string | null
}

export async function resolveImportTracks(sources: TrackImportSources) {
  let discogsTracks: Awaited<ReturnType<typeof fetchDiscogsReleaseData>>["tracks"] =
    []
  let discogsVideos: Awaited<ReturnType<typeof fetchDiscogsReleaseData>>["videos"] =
    []
  let mbTracks: Awaited<ReturnType<typeof fetchMusicBrainzTracks>> = []

  if (sources.discogsReleaseId) {
    try {
      const releaseData = await fetchDiscogsReleaseData(sources.discogsReleaseId)
      discogsTracks = releaseData.tracks
      discogsVideos = releaseData.videos
    } catch {
      discogsTracks = []
      discogsVideos = []
    }
  }

  if (sources.musicbrainzReleaseId) {
    try {
      mbTracks = await fetchMusicBrainzTracks(sources.musicbrainzReleaseId)
    } catch {
      mbTracks = []
    }
  }

  let tracks =
    discogsTracks.length === 0
      ? mbTracks
      : mbTracks.length === 0
        ? discogsTracks
        : mergeImportTracks(discogsTracks, mbTracks)

  if (discogsVideos.length > 0 && tracks.length > 0) {
    tracks = matchDiscogsVideosToTracks(tracks, discogsVideos)
  }

  return tracks
}
