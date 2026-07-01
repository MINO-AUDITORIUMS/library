import { spotifyFetch } from "@/lib/catalog/spotify/client"
import { mapSpotifyAlbum } from "@/lib/catalog/spotify/map-album"
import type { SpotifyAlbum } from "@/lib/catalog/spotify/types"

export async function fetchSpotifyAlbum(albumId: string) {
  const data = await spotifyFetch<SpotifyAlbum>({
    path: `/albums/${albumId}`,
  })
  return mapSpotifyAlbum(data)
}
