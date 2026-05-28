import type { MinoRatingSummary } from "@/lib/catalog/ratings"

export type AlbumFormat = "vinyl" | "cd" | "cassette" | "digital" | "other"

export type CatalogTag = {
  id: string
  name: string
}

export type AlbumTrack = {
  position: number
  title: string
  durationSeconds: number | null
}

export type AlbumSummary = {
  id: string
  title: string
  artist: string
  releaseYear: number
  label: string
  format: AlbumFormat
  minoRating: MinoRatingSummary
  tags: string[]
  genre: string
  genreName: string
  subgenreName: string
  country: string
  coverHue: number
  coverImageUrl: string | null
}

export type AlbumComment = {
  id: string
  body: string
  createdAt: string
  authorId: string
  authorEmail: string
  authorName: string | null
}

export type AlbumDetail = AlbumSummary & {
  discogsReleaseId: number | null
  releaseDate: string | null
  subgenre: string
  recordCompany: string
  producers: string[]
  certification: string | null
  trackCount: number
  totalDurationSeconds: number
  description: string
  personalNotes: string
  tracks: AlbumTrack[]
  officialClipsCount: number
  addedAt: string
}
