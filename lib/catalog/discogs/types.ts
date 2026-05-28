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
  discogsReleaseId: number
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
  format: string
  description: string
  trackCount: string
  coverUrl: string | null
}
