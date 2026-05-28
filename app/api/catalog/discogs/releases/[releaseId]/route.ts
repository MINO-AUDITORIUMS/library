import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import { buildMergedCatalogImportFromDiscogsReleaseId } from "@/lib/catalog/build-merged-catalog-import"
import { DiscogsApiError } from "@/lib/catalog/discogs/client"
import { MusicBrainzApiError } from "@/lib/catalog/musicbrainz/client"

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

    const payload = await buildMergedCatalogImportFromDiscogsReleaseId(id)
    return NextResponse.json(payload)
  } catch (error) {
    if (error instanceof DiscogsApiError || error instanceof MusicBrainzApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json(
      { error: "Impossible de récupérer la release." },
      { status: 500 }
    )
  }
}
