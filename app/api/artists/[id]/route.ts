import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import { getArtistDetailById } from "@/lib/catalog/db/artist-detail"
import { getArtistTitleById } from "@/lib/catalog/db/artists"
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
