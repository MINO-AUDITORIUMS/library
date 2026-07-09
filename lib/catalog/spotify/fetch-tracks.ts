import { spotifyFetch, spotifyFetchUrl } from "@/lib/catalog/spotify/client"
import type { ImportedTrack } from "@/lib/catalog/track-credits"
import { uniqueCreditNames } from "@/lib/catalog/track-credits"
import type {
  SpotifyAlbum,
  SpotifyAlbumTracksResponse,
  SpotifyTrack,
} from "@/lib/catalog/spotify/types"

function extractFeaturing(
  trackArtists: SpotifyTrack["artists"],
  albumArtistIds: Set<string>
) {
  return uniqueCreditNames(
    trackArtists
      .filter((artist) => !albumArtistIds.has(artist.id))
      .map((artist) => artist.name)
  )
}

async function fetchAllAlbumTracks(albumId: string) {
  const tracks: SpotifyTrack[] = []
  let nextUrl: string | null = null

  const first = await spotifyFetch<SpotifyAlbumTracksResponse>({
    path: `/albums/${albumId}/tracks`,
    searchParams: { limit: 50, market: "FR" },
  })

  tracks.push(...(first.items ?? []))
  nextUrl = first.next

  while (nextUrl) {
    const page = await spotifyFetchUrl<SpotifyAlbumTracksResponse>(nextUrl)
    tracks.push(...(page.items ?? []))
    nextUrl = page.next
  }

  return tracks
}

export async function fetchSpotifyTracks(albumId: string) {
  const album = await spotifyFetch<SpotifyAlbum>({
    path: `/albums/${albumId}`,
  })
  const albumArtistIdSet = new Set(album.artists.map((artist) => artist.id))
  const rawTracks = (await fetchAllAlbumTracks(albumId)).sort((a, b) => {
    if (a.disc_number !== b.disc_number) return a.disc_number - b.disc_number
    if (a.track_number !== b.track_number) return a.track_number - b.track_number
    return a.id.localeCompare(b.id)
  })
  const tracks: ImportedTrack[] = []

  let position = 0
  for (const track of rawTracks) {
    const title = track.name?.trim()
    if (!title) continue

    position += 1
    const durationSeconds =
      track.duration_ms > 0 ? Math.round(track.duration_ms / 1000) : null

    tracks.push({
      position,
      title,
      duration_seconds: durationSeconds,
      writers: [],
      producers: [],
      featuring: extractFeaturing(track.artists, albumArtistIdSet),
      spotify_track_id: track.id,
    })
  }

  return tracks
}
