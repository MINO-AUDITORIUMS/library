export type AlbumCreateFormState = {
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
  personalNotes: string
  trackCount: string
  spotifyAlbumId: string | null
  discogsReleaseId: number | null
  musicbrainzReleaseId: string | null
  discogsArtistId: number | null
  musicbrainzArtistId: string | null
  spotifyArtistId: string | null
  coverImageUrl: string | null
  certification: string
  tags: string[]
}

export const emptyAlbumCreateForm: AlbumCreateFormState = {
  title: "",
  artist: "",
  releaseYear: "",
  releaseDate: "",
  genre: "",
  subgenre: "",
  label: "",
  recordCompany: "",
  producers: "",
  country: "",
  personalNotes: "",
  trackCount: "",
  spotifyAlbumId: null,
  discogsReleaseId: null,
  musicbrainzReleaseId: null,
  discogsArtistId: null,
  musicbrainzArtistId: null,
  spotifyArtistId: null,
  coverImageUrl: null,
  certification: "",
  tags: [],
}

export function normalizeReleaseDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : ""
}

export function releaseToFormState(
  release: import("@/lib/catalog/fetch-catalog-import").CatalogImportRelease
): AlbumCreateFormState {
  return {
    title: release.title,
    artist: release.artist,
    releaseYear: release.releaseYear,
    releaseDate: normalizeReleaseDate(release.releaseDate),
    genre: release.genre,
    subgenre: release.subgenre,
    label: release.label,
    recordCompany: release.recordCompany,
    producers: release.producers,
    country: release.country,
    trackCount: release.trackCount,
    spotifyAlbumId: release.spotifyAlbumId,
    discogsReleaseId: release.discogsReleaseId,
    musicbrainzReleaseId: release.musicbrainzReleaseId,
    discogsArtistId: release.discogsArtistId,
    musicbrainzArtistId: release.musicbrainzArtistId,
    spotifyArtistId: release.spotifyArtistId,
    coverImageUrl: release.coverUrl,
    certification: release.certification,
    personalNotes: "",
    tags: [],
  }
}
