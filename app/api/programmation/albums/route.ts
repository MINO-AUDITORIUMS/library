import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import { listAlbumRefsForPicker } from "@/lib/programmation/db/album-refs"
import { formatSupabaseError } from "@/lib/supabase/errors"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const session = await getAuthenticatedUser()
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q") ?? ""
  const limitParam = searchParams.get("limit")
  const limit = limitParam ? Math.min(Number(limitParam) || 20, 50) : 20

  const supabase = await createClient()

  try {
    const albums = await listAlbumRefsForPicker(supabase, query, limit)
    return NextResponse.json({ albums })
  } catch (error) {
    return NextResponse.json(
      { error: formatSupabaseError(error) },
      { status: 500 }
    )
  }
}
