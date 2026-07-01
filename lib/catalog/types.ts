import type { MinoRatingSummary } from "@/lib/catalog/ratings"

export type ArtistSummary = {
  id: string
  name: string
  slug: string
  imageUrl: string | null
  country: string
  coverHue: number
  albumCount: number
}

export type CatalogTag = {
  id: string
  name: string
}

export type AlbumTrack = {
  position: number
  title: string
  durationSeconds: number | null
  writers: string[]
  producers: string[]
  featuring: string[]
  youtubeVideoId: string | null
}

export type AlbumSummary = {
  id: string
  title: string
  artist: string
  releaseYear: number
  label: string
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
  artistId: string | null
  discogsReleaseId: number | null
  musicbrainzReleaseId: string | null
  canSyncTracks: boolean
  releaseDate: string | null
  subgenre: string
  recordCompany: string
  producers: string[]
  certification: string | null
  trackCount: number
  totalDurationSeconds: number
  personalNotes: string
  tracks: AlbumTrack[]
  officialVideosCount: number
  addedAt: string
}

export type ArtistDetail = {
  id: string
  name: string
  slug: string
  bio: string
  imageUrl: string | null
  country: string
  coverHue: number
  discogsArtistId: number | null
  musicbrainzArtistId: string | null
  albums: AlbumSummary[]
  albumCount: number
  addedAt: string
}
