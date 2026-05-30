export type DiscogsSearchType = "release" | "master" | "artist" | "label"

export type DiscogsSearchResultItem = {
  id: number
  type: string
  title: string
  year?: string
  label?: string[]
  thumb?: string
  resourceUrl?: string
  country?: string
  format?: string[]
  genre?: string[]
  style?: string[]
}

export type DiscogsSearchResponse = {
  pagination: {
    page: number
    pages: number
    perPage: number
    items: number
  }
  results: DiscogsSearchResultItem[]
}

export type CatalogSearchHit = {
  key: string
  title: string
  artist: string
  subtitle: string
  year: string | null
  thumbUrl: string | null
  variantCount: number | null
  discogsMasterId: number | null
  musicbrainzReleaseGroupId: string | null
}

export type LegacyDiscogsSearchHit = {
  discogsId: number
  type: DiscogsSearchType
  title: string
  subtitle: string
  year: string | null
  thumbUrl: string | null
}

export type DiscogsCommunityStats = {
  averageRating: number
  ratingCount: number
  inCollection: number
  inWantlist: number
}

export type CatalogReleaseImport = {
  discogsReleaseId: number | null
  musicbrainzReleaseId: string | null
  barcode: string | null
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
  description: string
  trackCount: string
  coverUrl: string | null
  certification: string
}
