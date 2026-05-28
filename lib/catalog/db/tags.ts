import type { SupabaseClient, User } from "@supabase/supabase-js"

import { slugify } from "@/lib/catalog/slug"
import type { CatalogTag } from "@/lib/catalog/types"

export async function listTags(supabase: SupabaseClient): Promise<CatalogTag[]> {
  const { data, error } = await supabase
    .from("tags")
    .select("id, name")
    .order("name", { ascending: true })

  if (error) throw error
  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
  }))
}

export async function createTag(
  supabase: SupabaseClient,
  user: User,
  name: string
): Promise<CatalogTag | null> {
  const trimmed = name.trim()
  if (!trimmed) return null

  const { data: existing, error: findError } = await supabase
    .from("tags")
    .select("id, name")
    .ilike("name", trimmed)
    .maybeSingle()

  if (findError) throw findError
  if (existing?.id) {
    return { id: existing.id as string, name: existing.name as string }
  }

  const slug = slugify(trimmed) || "tag"
  const { data, error } = await supabase
    .from("tags")
    .insert({ name: trimmed, slug, created_by: user.id })
    .select("id, name")
    .single()

  if (error) {
    const { data: retry } = await supabase
      .from("tags")
      .select("id, name")
      .ilike("name", trimmed)
      .maybeSingle()

    if (retry?.id) {
      return { id: retry.id as string, name: retry.name as string }
    }
    throw error
  }

  return { id: data.id as string, name: data.name as string }
}

export async function deleteTag(supabase: SupabaseClient, tagId: string) {
  const { error } = await supabase.from("tags").delete().eq("id", tagId)
  if (error) throw error
  return true
}

export async function syncAlbumTags(
  supabase: SupabaseClient,
  user: User,
  albumId: string,
  tagNames: string[]
) {
  const { error: deleteError } = await supabase
    .from("album_tags")
    .delete()
    .eq("album_id", albumId)

  if (deleteError) throw deleteError

  const seen = new Set<string>()

  for (const rawName of tagNames) {
    const trimmed = rawName.trim()
    if (!trimmed) continue
    const key = trimmed.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)

    const tag = await createTag(supabase, user, trimmed)
    if (!tag) continue

    const { error } = await supabase.from("album_tags").insert({
      album_id: albumId,
      tag_id: tag.id,
      created_by: user.id,
    })

    if (error) throw error
  }
}
