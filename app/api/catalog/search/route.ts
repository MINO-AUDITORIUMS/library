import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import { searchSpotifyAlbums } from "@/lib/catalog/spotify/search-albums"
import { SpotifyApiError } from "@/lib/catalog/spotify/client"

export async function GET(request: Request) {
  try {
    const session = await getAuthenticatedUser()
    if (!session) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")?.trim() ?? ""

    if (q.length < 2) {
      return NextResponse.json(
        { error: "La recherche doit contenir au moins 2 caractères." },
        { status: 400 }
      )
    }

    const results = await searchSpotifyAlbums(q)

    return NextResponse.json({ results })
  } catch (error) {
    if (error instanceof SpotifyApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json(
      { error: "Impossible de lancer la recherche catalogue." },
      { status: 500 }
    )
  }
}
