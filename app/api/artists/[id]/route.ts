import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import { updateArtist } from "@/lib/catalog/db/artist-update"
import { getArtistDetailById } from "@/lib/catalog/db/artist-detail"
import { getArtistTitleById } from "@/lib/catalog/db/artists"
import { parseUpdateArtistInput } from "@/lib/catalog/update-artist-input"
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
      const title = await getArtistTitleById(supabase, id)
      if (!title) {
        return NextResponse.json({ error: "Artiste introuvable." }, { status: 404 })
      }
      return NextResponse.json({ title })
    }

    const artist = await getArtistDetailById(supabase, id)
    if (!artist) {
      return NextResponse.json({ error: "Artiste introuvable." }, { status: 404 })
    }

    return NextResponse.json({ artist })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Impossible de lire l'artiste."
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

  const input = parseUpdateArtistInput(body)
  if (!input) {
    return NextResponse.json(
      { error: "Le nom de l'artiste est obligatoire." },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  try {
    const existing = await getArtistDetailById(supabase, id)
    if (!existing) {
      return NextResponse.json({ error: "Artiste introuvable." }, { status: 404 })
    }

    const artistId = await updateArtist(supabase, id, input)
    return NextResponse.json({ id: artistId })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Impossible de mettre à jour l'artiste."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
