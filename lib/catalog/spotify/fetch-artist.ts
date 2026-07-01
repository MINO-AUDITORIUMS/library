import { spotifyFetch } from "@/lib/catalog/spotify/client"
import type { SpotifyArtist } from "@/lib/catalog/spotify/types"

export type SpotifyArtistProfile = {
  name: string
  imageUrl: string | null
  genres: string[]
}

export async function fetchSpotifyArtistProfile(artistId: string) {
  const data = await spotifyFetch<SpotifyArtist>({
    path: `/artists/${artistId}`,
  })

  const imageUrl =
    [...(data.images ?? [])].sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0]
      ?.url ?? null

  return {
    name: data.name?.trim() ?? "",
    imageUrl,
    genres: (data.genres ?? []).filter(Boolean),
  } satisfies SpotifyArtistProfile
}
