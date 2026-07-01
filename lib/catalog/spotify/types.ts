export type SpotifyImage = {
  url: string
  height: number | null
  width: number | null
}

export type SpotifyArtistRef = {
  id: string
  name: string
}

export type SpotifyAlbumType = "album" | "single" | "compilation"

export type SpotifyAlbumSearchItem = {
  id: string
  name: string
  album_type: SpotifyAlbumType | string
  artists: SpotifyArtistRef[]
  images: SpotifyImage[]
  release_date: string
  release_date_precision: string
  total_tracks: number
}

export type SpotifyAlbumSearchResponse = {
  albums: {
    items: SpotifyAlbumSearchItem[]
  }
}

export type SpotifyAlbum = {
  id: string
  name: string
  album_type: SpotifyAlbumType | string
  artists: SpotifyArtistRef[]
  images: SpotifyImage[]
  release_date: string
  release_date_precision: string
  total_tracks: number
  label?: string
  copyrights?: { text: string; type: string }[]
  external_ids?: { upc?: string }
}

export type SpotifyTrack = {
  id: string
  name: string
  track_number: number
  disc_number: number
  duration_ms: number
  artists: SpotifyArtistRef[]
}

export type SpotifyAlbumTracksResponse = {
  items: SpotifyTrack[]
  next: string | null
}

export type SpotifyArtist = {
  id: string
  name: string
  images: SpotifyImage[]
  genres: string[]
  followers?: { total: number }
}

export type SpotifyPartialImport = {
  spotifyAlbumId: string
  spotifyArtistId: string | null
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
  barcode: string | null
}
