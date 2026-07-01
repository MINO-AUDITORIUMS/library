import type { SupabaseClient } from "@supabase/supabase-js"

import { getDiscogsConfig } from "@/lib/catalog/discogs/config"

export const ALBUM_COVERS_BUCKET = "album-covers"

export const ALBUM_COVER_MAX_BYTES = 10 * 1024 * 1024

export const ALBUM_COVER_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const

function extensionFromContentType(contentType: string) {
  if (contentType.includes("png")) return "png"
  if (contentType.includes("webp")) return "webp"
  if (contentType.includes("gif")) return "gif"
  return "jpg"
}

export function getAlbumCoverPublicUrl(storagePath: string | null | undefined) {
  if (!storagePath?.trim()) return null
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "")
  if (!baseUrl) return null
  return `${baseUrl}/storage/v1/object/public/${ALBUM_COVERS_BUCKET}/${storagePath}`
}

function coverFetchHeaders(sourceUrl: string): Record<string, string> {
  if (/\.scdn\.co\//i.test(sourceUrl) || /spotify\.com/i.test(sourceUrl)) {
    return { Accept: "image/*" }
  }
  const { userAgent } = getDiscogsConfig()
  return { "User-Agent": userAgent, Accept: "image/*" }
}

export async function uploadAlbumCoverFromUrl(
  supabase: SupabaseClient,
  albumId: string,
  sourceUrl: string
): Promise<string | null> {
  const trimmed = sourceUrl.trim()
  if (!trimmed) return null

  const response = await fetch(trimmed, {
    headers: coverFetchHeaders(trimmed),
  })

  if (!response.ok) return null

  const contentType = response.headers.get("content-type") ?? "image/jpeg"
  if (!contentType.startsWith("image/")) return null

  const extension = extensionFromContentType(contentType)
  const storagePath = `${albumId}/cover.${extension}`
  const bytes = await response.arrayBuffer()

  const { error } = await supabase.storage
    .from(ALBUM_COVERS_BUCKET)
    .upload(storagePath, bytes, {
      contentType,
      upsert: true,
      cacheControl: "31536000",
    })

  if (error) return null
  return storagePath
}

export async function uploadAlbumCoverBytes(
  supabase: SupabaseClient,
  albumId: string,
  bytes: ArrayBuffer,
  contentType: string
): Promise<string | null> {
  if (!contentType.startsWith("image/")) return null

  const extension = extensionFromContentType(contentType)
  const storagePath = `${albumId}/cover-${Date.now()}.${extension}`

  const { error } = await supabase.storage
    .from(ALBUM_COVERS_BUCKET)
    .upload(storagePath, bytes, {
      contentType,
      upsert: true,
      cacheControl: "31536000",
    })

  if (error) return null
  return storagePath
}

export async function removeAlbumCover(
  supabase: SupabaseClient,
  storagePath: string
) {
  await supabase.storage.from(ALBUM_COVERS_BUCKET).remove([storagePath])
}
