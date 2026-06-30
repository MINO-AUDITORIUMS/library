import type { SupabaseClient, User } from "@supabase/supabase-js"

import { ensureProfile } from "@/lib/auth/ensure-profile"
import { coverHueFromId } from "@/lib/catalog/cover-hue"
import { getAlbumCoverPublicUrl } from "@/lib/catalog/storage/album-cover"
import { minutesFromSeconds } from "@/lib/programmation/duration"
import type {
  ProgrammationAlbumRef,
  ProgrammationSession,
  SessionStatus,
} from "@/lib/programmation/types"

type SeanceRow = {
  id: string
  album_id: string
  date: string
  heure_debut: string
  duree_minutes: number
  notes: string
  statut: SessionStatus
  created_at: string
  updated_at: string
  albums: {
    id: string
    title: string
    artist: string
    total_duration_seconds: number | null
    cover_storage_path: string | null
  } | {
    id: string
    title: string
    artist: string
    total_duration_seconds: number | null
    cover_storage_path: string | null
  }[] | null
}

const seanceSelect = `
  id,
  album_id,
  date,
  heure_debut,
  duree_minutes,
  notes,
  statut,
  created_at,
  updated_at,
  albums (
    id,
    title,
    artist,
    total_duration_seconds,
    cover_storage_path
  )
`

function readAlbum(row: SeanceRow) {
  const album = row.albums
  if (!album) return null
  return Array.isArray(album) ? album[0] ?? null : album
}

function formatTimeFromDb(value: string) {
  return value.slice(0, 5)
}

export function albumRowToRef(album: {
  id: string
  title: string
  artist: string
  total_duration_seconds: number | null
  cover_storage_path: string | null
}): ProgrammationAlbumRef {
  return {
    albumId: album.id,
    title: album.title,
    artist: album.artist,
    durationMinutes: minutesFromSeconds(album.total_duration_seconds ?? 0),
    coverHue: coverHueFromId(album.id),
    coverImageUrl: getAlbumCoverPublicUrl(album.cover_storage_path),
  }
}

export function mapSeanceRow(row: SeanceRow): ProgrammationSession {
  const album = readAlbum(row)
  if (!album) {
    throw new Error("Séance sans album associé.")
  }

  return {
    id: row.id,
    album: albumRowToRef(album),
    date: row.date,
    startTime: formatTimeFromDb(row.heure_debut),
    durationMinutes: row.duree_minutes,
    notes: row.notes,
    status: row.statut,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function getAlbumDurationMinutes(
  supabase: SupabaseClient,
  albumId: string
) {
  const { data, error } = await supabase
    .from("albums")
    .select("total_duration_seconds")
    .eq("id", albumId)
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error("Album introuvable.")
  return minutesFromSeconds(data.total_duration_seconds ?? 0)
}

export async function listSessions(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("seances")
    .select(seanceSelect)
    .order("date", { ascending: true })
    .order("heure_debut", { ascending: true })

  if (error) throw error
  return (data as unknown as SeanceRow[]).map(mapSeanceRow)
}

export async function createSession(
  supabase: SupabaseClient,
  user: User,
  input: {
    albumId: string
    date: string
    startTime: string
    notes: string
    status: SessionStatus
  }
) {
  await ensureProfile(supabase, user)

  const durationMinutes = await getAlbumDurationMinutes(supabase, input.albumId)

  const { data, error } = await supabase
    .from("seances")
    .insert({
      album_id: input.albumId,
      date: input.date,
      heure_debut: input.startTime,
      duree_minutes: durationMinutes,
      notes: input.notes.trim(),
      statut: input.status,
      created_by: user.id,
    })
    .select(seanceSelect)
    .single()

  if (error) throw error
  return mapSeanceRow(data as unknown as SeanceRow)
}

export type UpdateSessionInput = {
  albumId?: string
  date?: string
  startTime?: string
  notes?: string
  status?: SessionStatus
}

export async function updateSession(
  supabase: SupabaseClient,
  sessionId: string,
  input: UpdateSessionInput
) {
  const patch: Record<string, unknown> = {}

  if (input.date !== undefined) patch.date = input.date
  if (input.startTime !== undefined) patch.heure_debut = input.startTime
  if (input.notes !== undefined) patch.notes = input.notes.trim()
  if (input.status !== undefined) patch.statut = input.status

  if (input.albumId !== undefined) {
    patch.album_id = input.albumId
    patch.duree_minutes = await getAlbumDurationMinutes(supabase, input.albumId)
  }

  const { data, error } = await supabase
    .from("seances")
    .update(patch)
    .eq("id", sessionId)
    .select(seanceSelect)
    .single()

  if (error) throw error
  return mapSeanceRow(data as unknown as SeanceRow)
}

export async function deleteSession(supabase: SupabaseClient, sessionId: string) {
  const { error } = await supabase.from("seances").delete().eq("id", sessionId)
  if (error) throw error
}
