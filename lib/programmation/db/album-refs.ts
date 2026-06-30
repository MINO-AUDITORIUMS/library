import type { SupabaseClient } from "@supabase/supabase-js"

import { albumRowToRef } from "@/lib/programmation/db/sessions"
import type { ProgrammationAlbumRef } from "@/lib/programmation/types"

type AlbumPickerRow = {
  id: string
  title: string
  artist: string
  total_duration_seconds: number | null
  cover_storage_path: string | null
}

export async function listAlbumRefsForPicker(
  supabase: SupabaseClient,
  query?: string,
  limit = 20
): Promise<ProgrammationAlbumRef[]> {
  const trimmed = query?.trim() ?? ""

  let request = supabase
    .from("albums")
    .select("id, title, artist, total_duration_seconds, cover_storage_path")
    .order("title", { ascending: true })
    .limit(limit)

  if (trimmed.length >= 2) {
    const escaped = trimmed.replace(/"/g, '""').replace(/[%_\\]/g, "\\$&")
    const pattern = `%${escaped}%`
    request = request.or(`title.ilike."${pattern}",artist.ilike."${pattern}"`)
  }

  const { data, error } = await request
  if (error) throw error

  return (data as AlbumPickerRow[]).map(albumRowToRef)
}

export async function getAlbumRefById(
  supabase: SupabaseClient,
  albumId: string
): Promise<ProgrammationAlbumRef | null> {
  const { data, error } = await supabase
    .from("albums")
    .select("id, title, artist, total_duration_seconds, cover_storage_path")
    .eq("id", albumId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  return albumRowToRef(data as AlbumPickerRow)
}
