import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import {
  createAlbumComment,
  listAlbumComments,
} from "@/lib/catalog/db/album-comments"
import { formatSupabaseError } from "@/lib/supabase/errors"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getAuthenticatedUser()
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 })
  }

  const { id: albumId } = await context.params
  const supabase = await createClient()

  try {
    const comments = await listAlbumComments(supabase, albumId)
    return NextResponse.json({ comments })
  } catch (error) {
    return NextResponse.json(
      { error: formatSupabaseError(error) },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getAuthenticatedUser()
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 })
  }

  const { id: albumId } = await context.params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 })
  }

  const text =
    typeof body === "object" &&
    body !== null &&
    "body" in body &&
    typeof (body as { body: unknown }).body === "string"
      ? (body as { body: string }).body
      : ""

  if (!text.trim()) {
    return NextResponse.json(
      { error: "Le commentaire ne peut pas être vide." },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  try {
    const comment = await createAlbumComment(
      supabase,
      albumId,
      session.user.id,
      text
    )
    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    const message = formatSupabaseError(error)
    const status = message.includes("vide") ? 400 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
