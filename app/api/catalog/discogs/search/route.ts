import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import { discogsFetch, DiscogsApiError } from "@/lib/catalog/discogs/client"
import { mapDiscogsSearchResponse } from "@/lib/catalog/discogs/map-search"
import type {
  DiscogsSearchResponse,
  DiscogsSearchType,
} from "@/lib/catalog/discogs/types"

const SEARCH_TYPES = new Set<DiscogsSearchType>([
  "release",
  "master",
  "artist",
  "label",
])

export async function GET(request: Request) {
  try {
    const session = await getAuthenticatedUser()
    if (!session) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")?.trim() ?? ""
    const typeParam = searchParams.get("type") ?? "release"
    const type = SEARCH_TYPES.has(typeParam as DiscogsSearchType)
      ? (typeParam as DiscogsSearchType)
      : "release"

    if (q.length < 2) {
      return NextResponse.json(
        { error: "La recherche doit contenir au moins 2 caractères." },
        { status: 400 }
      )
    }

    const data = await discogsFetch<DiscogsSearchResponse>({
      path: "/database/search",
      searchParams: {
        q,
        type,
        per_page: 12,
      },
    })

    return NextResponse.json({
      results: mapDiscogsSearchResponse(data, type),
    })
  } catch (error) {
    if (error instanceof DiscogsApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json(
      { error: "Impossible de contacter Discogs." },
      { status: 500 }
    )
  }
}
