export type AlbumFormat = "vinyl" | "cd" | "cassette" | "digital" | "other"

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
  rating: number | null
  tags: string[]
  genre: string
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
  releaseDate: string | null
  subgenre: string
  recordCompany: string
  producers: string[]
  country: string
  certification: string | null
  trackCount: number
  totalDurationSeconds: number
  description: string
  personalNotes: string
  tracks: AlbumTrack[]
  officialClipsCount: number
  addedAt: string
}
