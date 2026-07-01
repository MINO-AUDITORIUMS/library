import { stripCatalogDisambiguation } from "@/lib/catalog/normalize-artist-name"
import { spotifyFetch } from "@/lib/catalog/spotify/client"
import type {
  SpotifyArtistSearchItem,
  SpotifyArtistSearchResponse,
} from "@/lib/catalog/spotify/types"
import type { FeatArtistSearchHit } from "@/lib/catalog/feat-artist-search-hit"

function pickThumbUrl(item: SpotifyArtistSearchItem) {
  const images = item.images ?? []
  if (images.length === 0) return null
  const sorted = [...images].sort((a, b) => (b.width ?? 0) - (a.width ?? 0))
  return sorted.at(-1)?.url ?? sorted[0]?.url ?? null
}

export async function searchSpotifyArtists(query: string) {
  const data = await spotifyFetch<SpotifyArtistSearchResponse>({
    path: "/search",
    searchParams: {
      q: query,
      type: "artist",
      limit: 8,
      market: "FR",
    },
  })

  return (data.artists?.items ?? [])
    .map(
      (item): FeatArtistSearchHit => ({
        key: `spotify:${item.id}`,
        name: stripCatalogDisambiguation(item.name),
        source: "spotify",
        imageUrl: pickThumbUrl(item),
      })
    )
    .filter((hit) => hit.name.length > 0)
}
