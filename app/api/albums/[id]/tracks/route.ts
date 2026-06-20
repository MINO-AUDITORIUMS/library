import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import { parseAlbumTracksInput } from "@/lib/catalog/album-tracks-input"
import {
  getEditableAlbumTracks,
  replaceAlbumTracks,
} from "@/lib/catalog/db/album-tracks"
import { createClient } from "@/lib/supabase/server"

export async function GET(
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
    const tracks = await getEditableAlbumTracks(supabase, id)
    if (tracks === null) {
      return NextResponse.json({ error: "Album introuvable." }, { status: 404 })
    }
    return NextResponse.json({ tracks })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Impossible de lire la tracklist."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(
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
    return NextResponse.json(
      { error: "Corps de requête invalide." },
      { status: 400 }
    )
  }

  const tracks = parseAlbumTracksInput(body)
  if (!tracks) {
    return NextResponse.json(
      { error: "Chaque piste doit avoir un titre." },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  try {
    const result = await replaceAlbumTracks(supabase, session.user, id, tracks)
    if (result === null) {
      return NextResponse.json({ error: "Album introuvable." }, { status: 404 })
    }
    return NextResponse.json(result)
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Impossible de mettre à jour la tracklist."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
