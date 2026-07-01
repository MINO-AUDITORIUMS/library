import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import { updateAlbumTrackVideo } from "@/lib/catalog/db/album-tracks"
import { parseYouTubeVideoInput } from "@/lib/catalog/youtube"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; position: string }> }
) {
  const session = await getAuthenticatedUser()
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 })
  }

  const { id, position: positionParam } = await context.params
  const position = Number.parseInt(positionParam, 10)

  if (!Number.isFinite(position) || position < 1) {
    return NextResponse.json({ error: "Piste invalide." }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide." },
      { status: 400 }
    )
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Corps de requête invalide." },
      { status: 400 }
    )
  }

  const youtubeUrl = (body as Record<string, unknown>).youtubeUrl
  if (typeof youtubeUrl !== "string" || youtubeUrl.trim().length === 0) {
    return NextResponse.json(
      { error: "Lien YouTube requis." },
      { status: 400 }
    )
  }

  const youtubeVideoId = parseYouTubeVideoInput(youtubeUrl)
  if (!youtubeVideoId) {
    return NextResponse.json(
      { error: "Lien YouTube invalide." },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  try {
    const result = await updateAlbumTrackVideo(
      supabase,
      session.user,
      id,
      position,
      youtubeVideoId
    )

    if (result === null) {
      return NextResponse.json({ error: "Piste introuvable." }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Impossible d'ajouter le clip."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
