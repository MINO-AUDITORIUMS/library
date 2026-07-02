import type { ArtistImportPreview } from "@/lib/catalog/build-artist-preview"

export type CatalogImportRelease = {
  title: string
  artist: string
  releaseYear: string
  releaseDate: string
  genre: string
  subgenre: string
  label: string
  recordCompany: string
  producers: string
  country: string
  trackCount: string
  spotifyAlbumId: string | null
  discogsReleaseId: number | null
  musicbrainzReleaseId: string | null
  discogsArtistId: number | null
  musicbrainzArtistId: string | null
  spotifyArtistId: string | null
  coverUrl: string | null
  certification: string
}

export type CatalogImportResponse = {
  release?: CatalogImportRelease
  artist?: ArtistImportPreview | null
  sources?: {
    spotify: boolean
    discogs: boolean
    musicbrainz: boolean
  }
  variantCount?: number | null
  existingAlbumId?: string | null
  error?: string
}

export function buildCatalogImportUrl(spotifyAlbumId: string) {
  const params = new URLSearchParams()
  params.set("spotifyAlbum", spotifyAlbumId)
  return `/api/catalog/import?${params.toString()}`
}

export async function fetchCatalogImport(
  spotifyAlbumId: string
): Promise<{ ok: boolean; status: number; data: CatalogImportResponse }> {
  const response = await fetch(buildCatalogImportUrl(spotifyAlbumId))
  const data = (await response.json()) as CatalogImportResponse
  return { ok: response.ok, status: response.status, data }
}
