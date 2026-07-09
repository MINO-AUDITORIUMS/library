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

function normalizeToken(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
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

function pickBestDuplicateSpotifyAlbum(
  a: SpotifyAlbumSearchItem,
  b: SpotifyAlbumSearchItem
) {
  if (a.album_type !== b.album_type) {
    if (a.album_type === "album") return a
    if (b.album_type === "album") return b
  }

  if (a.total_tracks !== b.total_tracks) {
    return a.total_tracks > b.total_tracks ? a : b
  }

  if (a.images.length !== b.images.length) {
    return a.images.length > b.images.length ? a : b
  }

  return a.id.localeCompare(b.id) <= 0 ? a : b
}

function dedupeSpotifyAlbumSearchItems(items: SpotifyAlbumSearchItem[]) {
  const groups = new Map<string, SpotifyAlbumSearchItem>()

  for (const item of items) {
    const artist = item.artists[0]?.name ?? ""
    const year = parseYear(item.release_date) ?? ""
    const key = [
      normalizeToken(stripCatalogDisambiguation(item.name)),
      normalizeToken(stripCatalogDisambiguation(artist)),
      year,
    ].join("|")

    const existing = groups.get(key)
    if (!existing) {
      groups.set(key, item)
      continue
    }

    groups.set(key, pickBestDuplicateSpotifyAlbum(existing, item))
  }

  return [...groups.values()]
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

  const items = (data.albums?.items ?? []).filter(isBrowsableSpotifyRelease)
  const unique = dedupeSpotifyAlbumSearchItems(items)

  return unique.slice(0, 10).map(mapSpotifyAlbumSearchItem)
}
