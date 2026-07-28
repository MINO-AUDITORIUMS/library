import type { SupabaseClient, User } from "@supabase/supabase-js"

import { ensureProfile } from "@/lib/auth/ensure-profile"
import { coverHueFromId } from "@/lib/catalog/cover-hue"
import { getAlbumCoverPublicUrl } from "@/lib/catalog/storage/album-cover"
import {
  mapProjectStatusRow,
} from "@/lib/projects/db/project-statuses"
import { mapProjectTypeRow } from "@/lib/projects/db/project-types"
import type {
  Project,
  ProjectCreateInput,
  ProjectUpdateInput,
} from "@/lib/projects/types"

type AlbumEmbed = {
  id: string
  title: string
  artist: string
  cover_storage_path: string | null
}

type TypeEmbed = {
  id: string
  code: string
  label: string
  family: string
  sort_order: number
  is_active: boolean
}

type StatusEmbed = {
  id: string
  code: string
  label: string
  sort_order: number
  is_active: boolean
}

type LocationEmbed = {
  id: string
  name: string
  city: string
}

type ProjectRow = {
  id: string
  code: string
  title: string
  event_date: string | null
  event_end_date: string | null
  comment: string
  created_at: string
  updated_at: string
  albums: AlbumEmbed | AlbumEmbed[] | null
  project_types: TypeEmbed | TypeEmbed[] | null
  project_statuses: StatusEmbed | StatusEmbed[] | null
  locations: LocationEmbed | LocationEmbed[] | null
}

const projectSelect = `
  id,
  code,
  title,
  event_date,
  event_end_date,
  comment,
  created_at,
  updated_at,
  albums (
    id,
    title,
    artist,
    cover_storage_path
  ),
  project_types (
    id,
    code,
    label,
    family,
    sort_order,
    is_active
  ),
  project_statuses (
    id,
    code,
    label,
    sort_order,
    is_active
  ),
  locations!primary_location_id (
    id,
    name,
    city
  )
`

function readEmbed<T>(value: T | T[] | null): T | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

function mapProjectRow(row: ProjectRow): Project {
  const album = readEmbed(row.albums)
  const type = readEmbed(row.project_types)
  const status = readEmbed(row.project_statuses)
  const location = readEmbed(row.locations)

  if (!album) throw new Error("Projet sans album associé.")
  if (!type) throw new Error("Projet sans type associé.")
  if (!status) throw new Error("Projet sans statut associé.")

  return {
    id: row.id,
    code: row.code,
    title: row.title,
    album: {
      id: album.id,
      title: album.title,
      artist: album.artist,
      coverHue: coverHueFromId(album.id),
      coverImageUrl: getAlbumCoverPublicUrl(album.cover_storage_path),
    },
    type: mapProjectTypeRow(type),
    status: mapProjectStatusRow(status),
    location: location
      ? { id: location.id, name: location.name, city: location.city }
      : null,
    eventDate: row.event_date,
    eventEndDate: row.event_end_date,
    comment: row.comment ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function listProjects(
  supabase: SupabaseClient
): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select(projectSelect)
    .order("event_date", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false })

  if (error) throw error
  return ((data ?? []) as unknown as ProjectRow[]).map(mapProjectRow)
}

export async function getProjectById(
  supabase: SupabaseClient,
  projectId: string
): Promise<Project | null> {
  const { data, error } = await supabase
    .from("projects")
    .select(projectSelect)
    .eq("id", projectId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  return mapProjectRow(data as unknown as ProjectRow)
}

export async function createProject(
  supabase: SupabaseClient,
  user: User,
  input: ProjectCreateInput
): Promise<Project> {
  await ensureProfile(supabase, user)

  const { data, error } = await supabase
    .from("projects")
    .insert({
      code: input.code.trim(),
      title: input.title.trim(),
      album_id: input.albumId,
      project_type_id: input.typeId,
      project_status_id: input.statusId,
      primary_location_id: input.primaryLocationId || null,
      event_date: input.eventDate || null,
      event_end_date: input.eventEndDate || null,
      comment: (input.comment ?? "").trim(),
      created_by: user.id,
    })
    .select(projectSelect)
    .single()

  if (error) throw error
  return mapProjectRow(data as unknown as ProjectRow)
}

export async function updateProject(
  supabase: SupabaseClient,
  projectId: string,
  input: ProjectUpdateInput
): Promise<Project> {
  const patch: Record<string, unknown> = {}

  if (input.code !== undefined) patch.code = input.code.trim()
  if (input.title !== undefined) patch.title = input.title.trim()
  if (input.albumId !== undefined) patch.album_id = input.albumId
  if (input.typeId !== undefined) patch.project_type_id = input.typeId
  if (input.statusId !== undefined) patch.project_status_id = input.statusId
  if (input.primaryLocationId !== undefined) {
    patch.primary_location_id = input.primaryLocationId || null
  }
  if (input.eventDate !== undefined) patch.event_date = input.eventDate || null
  if (input.eventEndDate !== undefined) {
    patch.event_end_date = input.eventEndDate || null
  }
  if (input.comment !== undefined) patch.comment = input.comment.trim()

  const { data, error } = await supabase
    .from("projects")
    .update(patch)
    .eq("id", projectId)
    .select(projectSelect)
    .single()

  if (error) throw error
  return mapProjectRow(data as unknown as ProjectRow)
}

export async function deleteProject(
  supabase: SupabaseClient,
  projectId: string
) {
  const { error } = await supabase.from("projects").delete().eq("id", projectId)
  if (error) throw error
}
