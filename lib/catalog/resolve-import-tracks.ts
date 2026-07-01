import { isSpotifyOnlyCatalogImport } from "@/lib/catalog/import-flags"
import { fetchDiscogsReleaseData } from "@/lib/catalog/discogs/fetch-release"
import { findDiscogsReleaseImport } from "@/lib/catalog/link-discogs-release"
import { findMusicBrainzRelease } from "@/lib/catalog/musicbrainz/find-release"
import { fetchMusicBrainzTracks } from "@/lib/catalog/musicbrainz/fetch-tracks"
import { matchDiscogsVideosToTracks } from "@/lib/catalog/match-track-videos"
import { fetchSpotifyTracks } from "@/lib/catalog/spotify/fetch-tracks"
import { findSpotifyAlbumId } from "@/lib/catalog/spotify/link-album"
import type { ImportedTrack } from "@/lib/catalog/track-credits"
import { mergeImportTracks } from "@/lib/catalog/track-credits"

export type TrackImportSources = {
  spotifyAlbumId?: string | null
  discogsReleaseId?: number | null
  musicbrainzReleaseId?: string | null
  albumTitle?: string
  albumArtist?: string
  barcode?: string | null
}

export type ResolvedTrackImportSources = {
  spotifyAlbumId: string | null
  discogsReleaseId: number | null
  musicbrainzReleaseId: string | null
}

export type ResolveImportTracksResult = {
  tracks: ImportedTrack[]
  sources: ResolvedTrackImportSources
}

async function resolveDiscogsReleaseId(sources: TrackImportSources) {
  if (sources.discogsReleaseId) return sources.discogsReleaseId
  if (!sources.albumTitle?.trim() || !sources.albumArtist?.trim()) return null

  const discogs = await findDiscogsReleaseImport(
    sources.albumTitle,
    sources.albumArtist,
    sources.barcode ?? null
  ).catch(() => null)

  return discogs?.discogsReleaseId ?? null
}

async function resolveMusicBrainzReleaseId(sources: TrackImportSources) {
  if (sources.musicbrainzReleaseId) return sources.musicbrainzReleaseId
  if (!sources.albumTitle?.trim() || !sources.albumArtist?.trim()) return null

  const musicbrainz = await findMusicBrainzRelease({
    title: sources.albumTitle,
    artist: sources.albumArtist,
    releaseYear: "",
    discogsReleaseId: sources.discogsReleaseId ?? 0,
    barcode: sources.barcode ?? null,
  }).catch(() => null)

  return musicbrainz?.musicbrainzReleaseId ?? null
}

async function resolveSpotifyAlbumId(sources: TrackImportSources) {
  if (sources.spotifyAlbumId) return sources.spotifyAlbumId
  if (!sources.albumTitle?.trim() || !sources.albumArtist?.trim()) return null

  return findSpotifyAlbumId(sources.albumTitle, sources.albumArtist).catch(
    () => null
  )
}

export async function resolveImportTracks(
  sources: TrackImportSources
): Promise<ResolveImportTracksResult> {
  const spotifyOnly = isSpotifyOnlyCatalogImport()
  let spotifyTracks: ImportedTrack[] = []
  let discogsTracks: Awaited<ReturnType<typeof fetchDiscogsReleaseData>>["tracks"] =
    []
  let discogsVideos: Awaited<ReturnType<typeof fetchDiscogsReleaseData>>["videos"] =
    []
  let mbTracks: Awaited<ReturnType<typeof fetchMusicBrainzTracks>> = []

  let spotifyAlbumId = sources.spotifyAlbumId ?? null
  let discogsReleaseId = sources.discogsReleaseId ?? null
  let musicbrainzReleaseId = sources.musicbrainzReleaseId ?? null

  if (!spotifyOnly) {
    if (!spotifyAlbumId) {
      spotifyAlbumId = await resolveSpotifyAlbumId(sources)
    }
    if (!discogsReleaseId) {
      discogsReleaseId = await resolveDiscogsReleaseId(sources)
    }
    if (!musicbrainzReleaseId) {
      musicbrainzReleaseId = await resolveMusicBrainzReleaseId({
        ...sources,
        discogsReleaseId,
      })
    }
  }

  if (spotifyAlbumId) {
    try {
      spotifyTracks = await fetchSpotifyTracks(spotifyAlbumId)
    } catch {
      spotifyTracks = []
    }
  }

  if (!spotifyOnly && discogsReleaseId) {
    try {
      const releaseData = await fetchDiscogsReleaseData(discogsReleaseId)
      discogsTracks = releaseData.tracks
      discogsVideos = releaseData.videos
    } catch {
      discogsTracks = []
      discogsVideos = []
    }
  }

  if (!spotifyOnly && musicbrainzReleaseId) {
    try {
      mbTracks = await fetchMusicBrainzTracks(musicbrainzReleaseId)
    } catch {
      mbTracks = []
    }
  }

  let tracks = spotifyTracks

  if (discogsTracks.length > 0) {
    tracks =
      tracks.length === 0
        ? discogsTracks
        : mergeImportTracks(tracks, discogsTracks)
  }

  if (mbTracks.length > 0) {
    tracks =
      tracks.length === 0 ? mbTracks : mergeImportTracks(tracks, mbTracks)
  }

  if (discogsVideos.length > 0 && tracks.length > 0) {
    tracks = matchDiscogsVideosToTracks(tracks, discogsVideos)
  }

  return {
    tracks,
    sources: {
      spotifyAlbumId,
      discogsReleaseId,
      musicbrainzReleaseId,
    },
  }
}
