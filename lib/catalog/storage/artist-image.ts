import type { SupabaseClient } from "@supabase/supabase-js"

export const ARTIST_IMAGES_BUCKET = "artist-images"

export const ARTIST_IMAGE_MAX_BYTES = 10 * 1024 * 1024

export const ARTIST_IMAGE_MIME_TYPES = [
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

function buildArtistImageStoragePath(artistId: string, extension: string) {
  return `${artistId}/image-${Date.now()}.${extension}`
}

export function getArtistImagePublicUrl(storagePath: string | null | undefined) {
  if (!storagePath?.trim()) return null
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "")
  if (!baseUrl) return null
  return `${baseUrl}/storage/v1/object/public/${ARTIST_IMAGES_BUCKET}/${storagePath}`
}

export function resolveArtistImageUrl(input: {
  imageStoragePath: string | null | undefined
  imageUrl: string | null | undefined
}) {
  const stored = getArtistImagePublicUrl(input.imageStoragePath)
  if (stored) return stored
  const external = input.imageUrl?.trim()
  return external || null
}

export async function uploadArtistImageBytes(
  supabase: SupabaseClient,
  artistId: string,
  bytes: ArrayBuffer,
  contentType: string
): Promise<string | null> {
  if (!contentType.startsWith("image/")) return null

  const extension = extensionFromContentType(contentType)
  const storagePath = buildArtistImageStoragePath(artistId, extension)

  const { error } = await supabase.storage
    .from(ARTIST_IMAGES_BUCKET)
    .upload(storagePath, bytes, {
      contentType,
      upsert: true,
      cacheControl: "31536000",
    })

  if (error) return null
  return storagePath
}

export async function removeArtistImage(
  supabase: SupabaseClient,
  storagePath: string
) {
  await supabase.storage.from(ARTIST_IMAGES_BUCKET).remove([storagePath])
}
