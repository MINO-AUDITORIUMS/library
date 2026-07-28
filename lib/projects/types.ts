export type ProjectTypeFamily = string

export type ProjectType = {
  id: string
  code: string
  label: string
  family: string
  sortOrder: number
  isActive: boolean
}

export type ProjectStatus = {
  id: string
  code: string
  label: string
  sortOrder: number
  isActive: boolean
}

export type ProjectAlbumRef = {
  id: string
  title: string
  artist: string
  coverHue: number
  coverImageUrl: string | null
}

export type ProjectLocationRef = {
  id: string
  name: string
  city: string
} | null

export type Project = {
  id: string
  code: string
  title: string
  album: ProjectAlbumRef
  type: ProjectType
  status: ProjectStatus
  location: ProjectLocationRef
  eventDate: string | null
  eventEndDate: string | null
  comment: string
  createdAt: string
  updatedAt: string
}

export type ProjectCreateInput = {
  code: string
  title: string
  albumId: string
  typeId: string
  statusId: string
  primaryLocationId?: string | null
  eventDate?: string | null
  eventEndDate?: string | null
  comment?: string
}

export type ProjectUpdateInput = {
  code?: string
  title?: string
  albumId?: string
  typeId?: string
  statusId?: string
  primaryLocationId?: string | null
  eventDate?: string | null
  eventEndDate?: string | null
  comment?: string
}
