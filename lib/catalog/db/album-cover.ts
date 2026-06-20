import type { SupabaseClient, User } from "@supabase/supabase-js"

import {
  getAlbumCoverPublicUrl,
  removeAlbumCover,
  uploadAlbumCoverBytes,
} from "@/lib/catalog/storage/album-cover"

async function readCoverPath(supabase: SupabaseClient, albumId: string) {
  const { data, error } = await supabase
    .from("albums")
    .select("id, cover_storage_path")
    .eq("id", albumId)
    .maybeSingle()

  if (error) throw error
  if (!data) return undefined
  return (data.cover_storage_path as string | null) ?? null
}

async function discardCover(supabase: SupabaseClient, path: string | null) {
  if (!path?.trim()) return
  try {
    await removeAlbumCover(supabase, path)
  } catch {
    // The album row no longer references this object.
  }
}

export async function updateAlbumCover(
  supabase: SupabaseClient,
  user: User,
  albumId: string,
  bytes: ArrayBuffer,
  contentType: string
): Promise<string | null> {
  const previous = await readCoverPath(supabase, albumId)
  if (previous === undefined) return null

  const path = await uploadAlbumCoverBytes(supabase, albumId, bytes, contentType)
  if (!path) {
    throw new Error("Impossible d'enregistrer la pochette.")
  }

  const { error } = await supabase
    .from("albums")
    .update({ cover_storage_path: path, updated_by: user.id })
    .eq("id", albumId)

  if (error) throw error

  if (previous && previous !== path) {
    await discardCover(supabase, previous)
  }

  return getAlbumCoverPublicUrl(path)
}

export async function clearAlbumCover(
  supabase: SupabaseClient,
  user: User,
  albumId: string
): Promise<boolean | null> {
  const previous = await readCoverPath(supabase, albumId)
  if (previous === undefined) return null

  const { error } = await supabase
    .from("albums")
    .update({ cover_storage_path: null, updated_by: user.id })
    .eq("id", albumId)

  if (error) throw error

  await discardCover(supabase, previous)

  return true
}
