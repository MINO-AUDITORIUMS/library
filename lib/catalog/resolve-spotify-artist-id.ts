import { spotifyIdFromExternalIds } from "@/lib/catalog/external-ids"
import { normalizeArtistDisplayName } from "@/lib/catalog/normalize-artist-name"
import { spotifyFetch } from "@/lib/catalog/spotify/client"
import { searchSpotifyArtists } from "@/lib/catalog/spotify/search-artists"
import type { SpotifyAlbum } from "@/lib/catalog/spotify/types"

function spotifyIdFromSearchKey(key: string) {
  if (!key.startsWith("spotify:")) return null
  const id = key.slice("spotify:".length).trim()
  return id.length > 0 ? id : null
}

export async function resolveSpotifyArtistId(
  artistName: string,
  externalIds: Record<string, unknown>,
  albumSpotifyIds: string[]
): Promise<string | null> {
  const stored = spotifyIdFromExternalIds(externalIds)
  if (stored) return stored

  const uniqueAlbumIds = [
    ...new Set(albumSpotifyIds.map((id) => id.trim()).filter(Boolean)),
  ]

  for (const albumId of uniqueAlbumIds) {
    try {
      const album = await spotifyFetch<SpotifyAlbum>({
        path: `/albums/${albumId}`,
      })
      const id = album.artists[0]?.id?.trim()
      if (id) return id
    } catch {
    }
  }

  const trimmedName = normalizeArtistDisplayName(artistName)
  if (trimmedName.length < 2) return null

  const hits = await searchSpotifyArtists(trimmedName).catch(() => [])
  if (hits.length === 0) return null

  const target = trimmedName.toLowerCase()
  const exact = hits.find((hit) => hit.name.toLowerCase() === target)
  const picked = exact ?? hits[0]
  return spotifyIdFromSearchKey(picked.key)
}
