import { discogsFetch } from "@/lib/catalog/discogs/client"
import { mapDiscogsRelease } from "@/lib/catalog/discogs/map-release"
import { coverArtArchiveUrl } from "@/lib/catalog/musicbrainz/map-release"
import { fetchSpotifyAlbum } from "@/lib/catalog/spotify/fetch-album"

export type AlbumCoverSources = {
  spotifyAlbumId: string | null
  discogsReleaseId: number | null
  musicbrainzReleaseId: string | null
}

function pickCoverUrl(
  spotify: string | null,
  discogs: string | null,
  musicbrainz: string | null
) {
  if (spotify?.trim()) return spotify.trim()
  if (discogs?.trim()) return discogs.trim()
  if (musicbrainz?.trim()) return musicbrainz.trim()
  return null
}

export async function resolveAlbumCoverUrl(sources: AlbumCoverSources) {
  let spotifyCover: string | null = null
  let discogsCover: string | null = null
  let musicbrainzCover: string | null = null

  if (sources.spotifyAlbumId) {
    try {
      const album = await fetchSpotifyAlbum(sources.spotifyAlbumId)
      spotifyCover = album.coverUrl
    } catch {
    }
  }

  if (sources.discogsReleaseId) {
    try {
      const raw = await discogsFetch<unknown>({
        path: `/releases/${sources.discogsReleaseId}`,
      })
      discogsCover = mapDiscogsRelease(raw).coverUrl
    } catch {
    }
  }

  if (sources.musicbrainzReleaseId) {
    musicbrainzCover = coverArtArchiveUrl(sources.musicbrainzReleaseId)
  }

  return pickCoverUrl(spotifyCover, discogsCover, musicbrainzCover)
}
