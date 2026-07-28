import type { SupabaseClient, User } from "@supabase/supabase-js"

import { ensureProfile } from "@/lib/auth/ensure-profile"
import type {
  Location,
  LocationCreateInput,
  LocationRoom,
  LocationUpdateInput,
} from "@/lib/locations/types"

type LocationTypeEmbed = {
  id: string
  code: string
  label: string
}

type LocationRoomRow = {
  id: string
  name: string
  capacity: number | null
  sort_order: number
}

type LocationRow = {
  id: string
  name: string
  address: string
  city: string
  longitude: number
  latitude: number
  location_type_id: string
  location_types: LocationTypeEmbed | LocationTypeEmbed[] | null
  location_rooms: LocationRoomRow[] | null
}

const locationSelect = `
  id,
  name,
  address,
  city,
  longitude,
  latitude,
  location_type_id,
  location_types (
    id,
    code,
    label
  ),
  location_rooms (
    id,
    name,
    capacity,
    sort_order
  )
`

function readType(row: LocationRow): LocationTypeEmbed {
  const embedded = row.location_types
  const type = Array.isArray(embedded) ? embedded[0] ?? null : embedded
  if (type) return type
  return {
    id: row.location_type_id,
    code: "unknown",
    label: "Inconnu",
  }
}

function mapRoom(row: LocationRoomRow): LocationRoom {
  return {
    id: row.id,
    name: row.name,
    capacity: row.capacity,
    sortOrder: row.sort_order,
  }
}

function mapLocationRow(row: LocationRow): Location {
  const type = readType(row)
  const rooms = [...(row.location_rooms ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name, "fr"))
    .map(mapRoom)

  return {
    id: row.id,
    name: row.name,
    typeId: type.id,
    typeCode: type.code,
    typeLabel: type.label,
    address: row.address,
    city: row.city,
    position: {
      longitude: row.longitude,
      latitude: row.latitude,
    },
    rooms,
  }
}

function createRoomName(roomsCount: number) {
  return roomsCount === 0 ? "Salle principale" : `Salle ${roomsCount + 1}`
}

export async function listLocations(
  supabase: SupabaseClient
): Promise<Location[]> {
  const { data, error } = await supabase
    .from("locations")
    .select(locationSelect)
    .order("name", { ascending: true })

  if (error) throw error
  return ((data ?? []) as unknown as LocationRow[]).map(mapLocationRow)
}

export async function createLocation(
  supabase: SupabaseClient,
  user: User,
  input: LocationCreateInput
): Promise<Location> {
  await ensureProfile(supabase, user)

  const { data, error } = await supabase
    .from("locations")
    .insert({
      name: input.name.trim(),
      location_type_id: input.typeId,
      address: input.address.trim(),
      city: input.city.trim(),
      longitude: input.longitude,
      latitude: input.latitude,
      created_by: user.id,
    })
    .select(locationSelect)
    .single()

  if (error) throw error
  return mapLocationRow(data as unknown as LocationRow)
}

export async function updateLocation(
  supabase: SupabaseClient,
  locationId: string,
  input: LocationUpdateInput
): Promise<Location> {
  const patch: Record<string, unknown> = {}

  if (input.name !== undefined) patch.name = input.name.trim()
  if (input.typeId !== undefined) patch.location_type_id = input.typeId
  if (input.address !== undefined) patch.address = input.address.trim()
  if (input.city !== undefined) patch.city = input.city.trim()
  if (input.longitude !== undefined) patch.longitude = input.longitude
  if (input.latitude !== undefined) patch.latitude = input.latitude

  const { data, error } = await supabase
    .from("locations")
    .update(patch)
    .eq("id", locationId)
    .select(locationSelect)
    .single()

  if (error) throw error
  return mapLocationRow(data as unknown as LocationRow)
}

export async function deleteLocation(
  supabase: SupabaseClient,
  locationId: string
) {
  const { error } = await supabase
    .from("locations")
    .delete()
    .eq("id", locationId)

  if (error) throw error
}

export async function createLocationRoom(
  supabase: SupabaseClient,
  locationId: string
): Promise<LocationRoom> {
  const { data: existing, error: listError } = await supabase
    .from("location_rooms")
    .select("id, sort_order")
    .eq("location_id", locationId)
    .order("sort_order", { ascending: false })

  if (listError) throw listError

  const rooms = existing ?? []
  const maxSort =
    rooms.length > 0
      ? Math.max(...rooms.map((r) => (r.sort_order as number) ?? 0))
      : -1

  const { data, error } = await supabase
    .from("location_rooms")
    .insert({
      location_id: locationId,
      name: createRoomName(rooms.length),
      sort_order: maxSort + 1,
    })
    .select("id, name, capacity, sort_order")
    .single()

  if (error) throw error
  return mapRoom(data as LocationRoomRow)
}

export async function updateLocationRoom(
  supabase: SupabaseClient,
  roomId: string,
  input: { capacity: number | null }
): Promise<LocationRoom> {
  const capacity =
    input.capacity != null && input.capacity > 0 ? input.capacity : null

  const { data, error } = await supabase
    .from("location_rooms")
    .update({ capacity })
    .eq("id", roomId)
    .select("id, name, capacity, sort_order")
    .single()

  if (error) throw error
  return mapRoom(data as LocationRoomRow)
}

export async function deleteLocationRoom(
  supabase: SupabaseClient,
  roomId: string
) {
  const { error } = await supabase
    .from("location_rooms")
    .delete()
    .eq("id", roomId)

  if (error) throw error
}
