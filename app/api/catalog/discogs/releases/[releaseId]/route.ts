import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import { discogsFetch, DiscogsApiError } from "@/lib/catalog/discogs/client"
import { mapDiscogsRelease } from "@/lib/catalog/discogs/map-release"

export async function GET(
  _request: Request,
  context: { params: Promise<{ releaseId: string }> }
) {
  try {
    const session = await getAuthenticatedUser()
    if (!session) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 })
    }

    const { releaseId } = await context.params
    const id = Number(releaseId)
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ error: "ID release invalide." }, { status: 400 })
    }

    const data = await discogsFetch<unknown>({
      path: `/releases/${id}`,
    })

    return NextResponse.json({
      release: mapDiscogsRelease(data),
    })
  } catch (error) {
    if (error instanceof DiscogsApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json(
      { error: "Impossible de récupérer la release Discogs." },
      { status: 500 }
    )
  }
}
