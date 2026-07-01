import { stripCatalogDisambiguation } from "@/lib/catalog/normalize-artist-name"
import type { SpotifyAlbum, SpotifyImage } from "@/lib/catalog/spotify/types"

function pickBestImage(images: SpotifyImage[]) {
  if (images.length === 0) return null
  const sorted = [...images].sort(
    (a, b) => (b.width ?? 0) - (a.width ?? 0)
  )
  return sorted[0]?.url ?? null
}

function parseReleaseYear(releaseDate: string) {
  const match = releaseDate.match(/^(\d{4})/)
  return match?.[1] ?? ""
}

function parseReleaseDate(releaseDate: string, precision: string) {
  if (precision === "day" && /^\d{4}-\d{2}-\d{2}$/.test(releaseDate)) {
    return releaseDate
  }
  if (precision === "month" && /^\d{4}-\d{2}$/.test(releaseDate)) {
    return `${releaseDate}-01`
  }
  const year = parseReleaseYear(releaseDate)
  return year ? `${year}-01-01` : ""
}

function formatArtistNames(artists: { name: string }[]) {
  return artists
    .map((artist) => stripCatalogDisambiguation(artist.name))
    .filter(Boolean)
    .join(", ")
}

export function mapSpotifyAlbum(album: SpotifyAlbum) {
  const artist = formatArtistNames(album.artists)
  const barcode = album.external_ids?.upc?.trim() || null
  const copyrightText = (album.copyrights ?? [])
    .map((entry) => entry.text?.trim())
    .filter(Boolean)
    .join(" · ")

  return {
    spotifyAlbumId: album.id,
    spotifyArtistId: album.artists[0]?.id ?? null,
    title: stripCatalogDisambiguation(album.name),
    artist,
    releaseYear: parseReleaseYear(album.release_date),
    releaseDate: parseReleaseDate(
      album.release_date,
      album.release_date_precision
    ),
    genre: "",
    subgenre: "",
    label: album.label?.trim() ?? "",
    recordCompany: album.label?.trim() ?? "",
    producers: "",
    country: "",
    description: copyrightText,
    trackCount:
      album.total_tracks > 0 ? String(album.total_tracks) : "",
    coverUrl: pickBestImage(album.images),
    barcode,
  }
}
