export type LocationRoom = {
  id: string
  name: string
  capacity: number | null
  sortOrder: number
}

export type LocationType = {
  id: string
  code: string
  label: string
  sortOrder: number
  isActive: boolean
}

export type Location = {
  id: string
  name: string
  typeId: string
  typeCode: string
  typeLabel: string
  address: string
  city: string
  position: { longitude: number; latitude: number }
  rooms: LocationRoom[]
}

export type LocationCreateInput = {
  name: string
  typeId: string
  address: string
  city: string
  longitude: number
  latitude: number
}

export type LocationUpdateInput = {
  name?: string
  typeId?: string
  address?: string
  city?: string
  longitude?: number
  latitude?: number
}
