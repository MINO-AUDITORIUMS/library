import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import { getAlbumDetailById, getAlbumTitleById } from "@/lib/catalog/db/albums"
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
