import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import { clearAlbumCover, updateAlbumCover } from "@/lib/catalog/db/album-cover"
import {
  ALBUM_COVER_MAX_BYTES,
  ALBUM_COVER_MIME_TYPES,
} from "@/lib/catalog/storage/album-cover"
import { createClient } from "@/lib/supabase/server"

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getAuthenticatedUser()
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 })
  }

  const { id } = await context.params

  let file: File | null = null
  try {
    const formData = await request.formData()
    const value = formData.get("file")
    file = value instanceof File ? value : null
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide." },
      { status: 400 }
    )
  }

  if (!file) {
    return NextResponse.json({ error: "Aucun fichier fourni." }, { status: 400 })
  }

  if (!ALBUM_COVER_MIME_TYPES.includes(file.type as never)) {
    return NextResponse.json(
      { error: "Format d'image non supporté (JPEG, PNG, WebP ou GIF)." },
      { status: 415 }
    )
  }

  if (file.size > ALBUM_COVER_MAX_BYTES) {
    return NextResponse.json(
      { error: "L'image dépasse la taille maximale de 10 Mo." },
      { status: 413 }
    )
  }

  const supabase = await createClient()

  try {
    const bytes = await file.arrayBuffer()
    const coverImageUrl = await updateAlbumCover(
      supabase,
      session.user,
      id,
      bytes,
      file.type
    )
    if (coverImageUrl === null) {
      return NextResponse.json({ error: "Album introuvable." }, { status: 404 })
    }
    return NextResponse.json({ coverImageUrl })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Impossible de mettre à jour la pochette."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getAuthenticatedUser()
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 })
  }

  const { id } = await context.params
  const supabase = await createClient()

  try {
    const cleared = await clearAlbumCover(supabase, session.user, id)
    if (cleared === null) {
      return NextResponse.json({ error: "Album introuvable." }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Impossible de supprimer la pochette."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
