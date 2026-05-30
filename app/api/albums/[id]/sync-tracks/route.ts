import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import {
  SyncAlbumTracksError,
  syncAlbumTracks,
} from "@/lib/catalog/sync-album-tracks"
import { createClient } from "@/lib/supabase/server"

export async function POST(
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
    const result = await syncAlbumTracks(supabase, id)
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof SyncAlbumTracksError) {
      const status =
        error.code === "not_found"
          ? 404
          : error.code === "no_sources" || error.code === "no_tracks"
            ? 422
            : 500
      return NextResponse.json({ error: error.message }, { status })
    }

    const message =
      error instanceof Error
        ? error.message
        : "Impossible de resynchroniser la tracklist."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
