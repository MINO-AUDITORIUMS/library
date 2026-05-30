export type MusicBrainzSearchRelease = {
  id: string
  title: string
  score: string
  date?: string
  country?: string
  "artist-credit"?: { artist: { name: string } }[]
}

export type MusicBrainzReleaseSearchResponse = {
  releases: MusicBrainzSearchRelease[]
}

export type MusicBrainzRelationArtist = {
  name: string
  id?: string
}

export type MusicBrainzRelation = {
  type?: string
  direction?: string
  artist?: MusicBrainzRelationArtist
  url?: { resource?: string }
}

export type MusicBrainzWorkRelation = {
  type?: string
  artist?: MusicBrainzRelationArtist
}

export type MusicBrainzWork = {
  id?: string
  title?: string
  relations?: MusicBrainzWorkRelation[]
}

export type MusicBrainzRecordingRelation = {
  type?: string
  artist?: MusicBrainzRelationArtist
  work?: MusicBrainzWork
}

export type MusicBrainzRecording = {
  id?: string
  title?: string
  length?: number
  relations?: MusicBrainzRecordingRelation[]
}

export type MusicBrainzRelease = {
  id: string
  title: string
  date?: string
  country?: string
  barcode?: string
  status?: string
  disambiguation?: string
  annotation?: string
  "artist-credit"?: {
    name?: string
    artist: { name: string; id?: string }
    joinphrase?: string
  }[]
  "label-info"?: {
    "catalog-number"?: string
    label?: { name?: string }
  }[]
  "release-group"?: {
    title?: string
    tags?: { name: string; count: number }[]
  }
  media?: {
    format?: string
    "track-count"?: number
    tracks?: {
      position: number
      title: string
      length?: number
      recording?: MusicBrainzRecording
    }[]
  }[]
  relations?: MusicBrainzRelation[]
  tags?: { name: string; count: number }[]
}

export type MusicBrainzPartialImport = {
  musicbrainzReleaseId: string
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
  discogsArtistId: number | null
  musicbrainzArtistId: string | null
}
