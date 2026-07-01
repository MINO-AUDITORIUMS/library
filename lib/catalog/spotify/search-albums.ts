import { spotifyFetch } from "@/lib/catalog/spotify/client"
import { stripCatalogDisambiguation } from "@/lib/catalog/normalize-artist-name"
import type { CatalogSearchHit } from "@/lib/catalog/discogs/types"
import type {
  SpotifyAlbumSearchItem,
  SpotifyAlbumSearchResponse,
} from "@/lib/catalog/spotify/types"

function pickThumbUrl(item: SpotifyAlbumSearchItem) {
  const images = item.images ?? []
  if (images.length === 0) return null
  const sorted = [...images].sort(
    (a, b) => (b.width ?? 0) - (a.width ?? 0)
  )
  return sorted.at(-1)?.url ?? sorted[0]?.url ?? null
}

function parseYear(releaseDate: string) {
  const match = releaseDate.match(/^(\d{4})/)
  return match?.[1] ?? null
}

function formatArtist(item: SpotifyAlbumSearchItem) {
  return item.artists
    .map((artist) => stripCatalogDisambiguation(artist.name))
    .filter(Boolean)
    .join(", ")
}

export function mapSpotifyAlbumSearchItem(
  item: SpotifyAlbumSearchItem
): CatalogSearchHit {
  const year = parseYear(item.release_date)
  const parts = ["Spotify"]

  return {
    key: `spotify-album:${item.id}`,
    title: stripCatalogDisambiguation(item.name),
    artist: formatArtist(item),
    subtitle: parts.join(" · "),
    year,
    thumbUrl: pickThumbUrl(item),
    variantCount: null,
    spotifyAlbumId: item.id,
    discogsMasterId: null,
    musicbrainzReleaseGroupId: null,
  }
}

export async function searchSpotifyAlbums(query: string) {
  const data = await spotifyFetch<SpotifyAlbumSearchResponse>({
    path: "/search",
    searchParams: {
      q: query,
      type: "album",
      limit: 20,
      market: "FR",
    },
  })

  return (data.albums?.items ?? [])
    .filter((item) => item.album_type === "album")
    .slice(0, 10)
    .map(mapSpotifyAlbumSearchItem)
}
