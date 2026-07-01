import type { CatalogSearchHit } from "@/lib/catalog/discogs/types"
import { stripCatalogDisambiguation } from "@/lib/catalog/normalize-artist-name"
import { spotifyFetch } from "@/lib/catalog/spotify/client"
import type {
  SpotifyAlbumSearchItem,
  SpotifyAlbumSearchResponse,
  SpotifyAlbumType,
} from "@/lib/catalog/spotify/types"

function pickThumbUrl(item: SpotifyAlbumSearchItem) {
  const images = item.images ?? []
  if (images.length === 0) return null
  const sorted = [...images].sort((a, b) => (b.width ?? 0) - (a.width ?? 0))
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

function spotifyReleaseKind(
  albumType: SpotifyAlbumType | string,
  totalTracks: number
) {
  if (albumType === "album") return "Album"
  if (albumType === "single" && totalTracks >= 2) return "EP"
  if (albumType === "single") return "Single"
  if (albumType === "compilation") return "Compilation"
  return "Sortie"
}

export function isBrowsableSpotifyRelease(item: SpotifyAlbumSearchItem) {
  if (item.album_type === "album") return true
  if (item.album_type === "single") return true
  return false
}

export function mapSpotifyAlbumSearchItem(
  item: SpotifyAlbumSearchItem
): CatalogSearchHit {
  const year = parseYear(item.release_date)
  const kind = spotifyReleaseKind(item.album_type, item.total_tracks)

  return {
    key: `spotify-album:${item.id}`,
    title: stripCatalogDisambiguation(item.name),
    artist: formatArtist(item),
    subtitle: `Spotify · ${kind}`,
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
      limit: 50,
      market: "FR",
    },
  })

  return (data.albums?.items ?? [])
    .filter(isBrowsableSpotifyRelease)
    .slice(0, 10)
    .map(mapSpotifyAlbumSearchItem)
}
