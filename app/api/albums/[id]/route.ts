import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import {
  deleteAlbum,
  getAlbumDetailById,
  getAlbumTitleById,
  updateAlbum,
} from "@/lib/catalog/db/albums"
import { parseUpdateAlbumInput } from "@/lib/catalog/update-album-input"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getAuthenticatedUser()
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 })
  }

  const { id } = await context.params
  const { searchParams } = new URL(request.url)
  const titleOnly = searchParams.get("titleOnly") === "1"

  const supabase = await createClient()

  try {
    if (titleOnly) {
      const title = await getAlbumTitleById(supabase, id)
      if (!title) {
        return NextResponse.json({ error: "Album introuvable." }, { status: 404 })
      }
      return NextResponse.json({ title })
    }

    const album = await getAlbumDetailById(supabase, id)
    if (!album) {
      return NextResponse.json({ error: "Album introuvable." }, { status: 404 })
    }

    return NextResponse.json({ album })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Impossible de lire l'album."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getAuthenticatedUser()
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 })
  }

  const { id } = await context.params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 })
  }

  const input = parseUpdateAlbumInput(body)
  if (!input) {
    return NextResponse.json(
      { error: "Titre et artiste sont obligatoires." },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  try {
    const albumId = await updateAlbum(supabase, session.user, id, input)
    if (!albumId) {
      return NextResponse.json({ error: "Album introuvable." }, { status: 404 })
    }
    return NextResponse.json({ id: albumId })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Impossible de mettre à jour l'album."
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
    const deleted = await deleteAlbum(supabase, id)
    if (!deleted) {
      return NextResponse.json({ error: "Album introuvable." }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Impossible de supprimer l'album."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
