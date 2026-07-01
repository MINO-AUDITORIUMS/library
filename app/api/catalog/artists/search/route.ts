import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import { searchFeatArtists } from "@/lib/catalog/search-feat-artists"
import { SpotifyApiError } from "@/lib/catalog/spotify/client"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const session = await getAuthenticatedUser()
    if (!session) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")?.trim() ?? ""

    if (query.length < 2) {
      return NextResponse.json(
        { error: "La recherche doit contenir au moins 2 caractères." },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const results = await searchFeatArtists(supabase, query)

    return NextResponse.json({ results })
  } catch (error) {
    if (error instanceof SpotifyApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    const message =
      error instanceof Error
        ? error.message
        : "Impossible de lancer la recherche d'artistes."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
