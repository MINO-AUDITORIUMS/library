import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import { parseCreateAlbumInput } from "@/lib/catalog/create-album-input"
import { createAlbum } from "@/lib/catalog/db/albums"
import { DuplicateAlbumError } from "@/lib/catalog/duplicate-album-error"
import { formatSupabaseError } from "@/lib/supabase/errors"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const session = await getAuthenticatedUser()
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 })
  }

  const input = parseCreateAlbumInput(body)
  if (!input) {
    return NextResponse.json(
      { error: "Titre et artiste sont obligatoires." },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  try {
    const albumId = await createAlbum(supabase, session.user, input)
    return NextResponse.json({ id: albumId }, { status: 201 })
  } catch (error) {
    if (error instanceof DuplicateAlbumError) {
      return NextResponse.json(
        { error: error.message, existingId: error.existingId },
        { status: 409 }
      )
    }
    const message = formatSupabaseError(error)
    const status =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "23514"
        ? 400
        : 500
    return NextResponse.json({ error: message }, { status })
  }
}
