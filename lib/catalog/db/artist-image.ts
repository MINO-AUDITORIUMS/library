import type { SupabaseClient } from "@supabase/supabase-js"

import {
  getArtistImagePublicUrl,
  removeArtistImage,
  uploadArtistImageBytes,
} from "@/lib/catalog/storage/artist-image"

async function readImagePath(supabase: SupabaseClient, artistId: string) {
  const { data, error } = await supabase
    .from("artists")
    .select("id, image_storage_path")
    .eq("id", artistId)
    .maybeSingle()

  if (error) throw error
  if (!data) return undefined
  return (data.image_storage_path as string | null) ?? null
}

async function discardImage(supabase: SupabaseClient, path: string | null) {
  if (!path?.trim()) return
  try {
    await removeArtistImage(supabase, path)
  } catch {
  }
}

export async function updateArtistImage(
  supabase: SupabaseClient,
  artistId: string,
  bytes: ArrayBuffer,
  contentType: string
): Promise<string | null> {
  const previous = await readImagePath(supabase, artistId)
  if (previous === undefined) return null

  const path = await uploadArtistImageBytes(supabase, artistId, bytes, contentType)
  if (!path) {
    throw new Error("Impossible d'enregistrer la photo.")
  }

  const { error } = await supabase
    .from("artists")
    .update({ image_storage_path: path, updated_at: new Date().toISOString() })
    .eq("id", artistId)

  if (error) throw error

  if (previous && previous !== path) {
    await discardImage(supabase, previous)
  }

  return getArtistImagePublicUrl(path)
}

export async function clearArtistImage(
  supabase: SupabaseClient,
  artistId: string
): Promise<boolean | null> {
  const { data, error: readError } = await supabase
    .from("artists")
    .select("id, image_storage_path, image_url")
    .eq("id", artistId)
    .maybeSingle()

  if (readError) throw readError
  if (!data) return null

  const storagePath = (data.image_storage_path as string | null) ?? null
  const externalUrl = (data.image_url as string | null) ?? null

  if (storagePath) {
    const { error } = await supabase
      .from("artists")
      .update({ image_storage_path: null, updated_at: new Date().toISOString() })
      .eq("id", artistId)

    if (error) throw error
    await discardImage(supabase, storagePath)
    return true
  }

  if (externalUrl?.trim()) {
    const { error } = await supabase
      .from("artists")
      .update({ image_url: null, updated_at: new Date().toISOString() })
      .eq("id", artistId)

    if (error) throw error
    return true
  }

  return true
}
