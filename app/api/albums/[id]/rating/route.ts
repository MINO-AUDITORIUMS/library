import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import { setAlbumUserRating } from "@/lib/catalog/db/album-user-ratings"
import { parseUserRatingBody } from "@/lib/catalog/ratings"
import { formatSupabaseError } from "@/lib/supabase/errors"
import { createClient } from "@/lib/supabase/server"

export async function PUT(
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

  const rating = parseUserRatingBody(body)
  if (rating === undefined) {
    return NextResponse.json(
      { error: "Note invalide (1 à 5, ou null pour effacer)." },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  try {
    const snapshot = await setAlbumUserRating(
      supabase,
      session.user,
      albumId,
      rating
    )
    return NextResponse.json(snapshot)
  } catch (error) {
    return NextResponse.json(
      { error: formatSupabaseError(error) },
      { status: 500 }
    )
  }
}
