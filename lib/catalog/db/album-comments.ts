import type { SupabaseClient } from "@supabase/supabase-js"

import type { AlbumComment } from "@/lib/catalog/types"

type CommentRow = {
  id: string
  body: string
  created_at: string
  author_id: string
  profiles:
    | { email: string | null; full_name: string | null }
    | { email: string | null; full_name: string | null }[]
    | null
}

function readProfile(
  profiles: CommentRow["profiles"]
): { email: string | null; full_name: string | null } | null {
  if (!profiles) return null
  if (Array.isArray(profiles)) return profiles[0] ?? null
  return profiles
}

function mapComment(row: CommentRow): AlbumComment {
  const profile = readProfile(row.profiles)
  return {
    id: row.id,
    body: row.body,
    createdAt: row.created_at,
    authorId: row.author_id,
    authorEmail: profile?.email ?? "Utilisateur",
    authorName: profile?.full_name ?? null,
  }
}

const commentSelect = `
  id,
  body,
  created_at,
  author_id,
  profiles(email, full_name)
`

export async function listAlbumComments(
  supabase: SupabaseClient,
  albumId: string
) {
  const { data, error } = await supabase
    .from("album_comments")
    .select(commentSelect)
    .eq("album_id", albumId)
    .order("created_at", { ascending: true })

  if (error) throw error
  return (data as unknown as CommentRow[]).map(mapComment)
}

export async function createAlbumComment(
  supabase: SupabaseClient,
  albumId: string,
  authorId: string,
  body: string
) {
  const trimmed = body.trim()
  if (!trimmed) {
    throw new Error("Le commentaire ne peut pas être vide.")
  }

  const { data, error } = await supabase
    .from("album_comments")
    .insert({
      album_id: albumId,
      author_id: authorId,
      body: trimmed,
    })
    .select(commentSelect)
    .single()

  if (error) throw error
  return mapComment(data as unknown as CommentRow)
}

export async function deleteAlbumComment(
  supabase: SupabaseClient,
  commentId: string
) {
  const { error } = await supabase
    .from("album_comments")
    .delete()
    .eq("id", commentId)

  if (error) throw error
}
