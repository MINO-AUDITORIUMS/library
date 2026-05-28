import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import { deleteAlbumComment } from "@/lib/catalog/db/album-comments"
import { formatSupabaseError } from "@/lib/supabase/errors"
import { createClient } from "@/lib/supabase/server"

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string; commentId: string }> }
) {
  const session = await getAuthenticatedUser()
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 })
  }

  const { commentId } = await context.params
  const supabase = await createClient()

  const { data: existing, error: readError } = await supabase
    .from("album_comments")
    .select("author_id")
    .eq("id", commentId)
    .maybeSingle()

  if (readError) {
    return NextResponse.json(
      { error: formatSupabaseError(readError) },
      { status: 500 }
    )
  }

  if (!existing) {
    return NextResponse.json({ error: "Commentaire introuvable." }, { status: 404 })
  }

  if (existing.author_id !== session.user.id) {
    return NextResponse.json({ error: "Action non autorisée." }, { status: 403 })
  }

  try {
    await deleteAlbumComment(supabase, commentId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: formatSupabaseError(error) },
      { status: 500 }
    )
  }
}
