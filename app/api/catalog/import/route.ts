import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import {
  buildMergedCatalogImportFromDiscogsMasterId,
  buildMergedCatalogImportFromDiscogsReleaseId,
  buildMergedCatalogImportFromMusicBrainzReleaseGroupId,
  buildMergedCatalogImportFromSpotifyAlbumId,
} from "@/lib/catalog/build-merged-catalog-import"
import { buildArtistImportPreview } from "@/lib/catalog/build-artist-preview"
import { findExistingAlbumId } from "@/lib/catalog/db/find-existing-album"
import { DiscogsApiError } from "@/lib/catalog/discogs/client"
import { MusicBrainzApiError } from "@/lib/catalog/musicbrainz/client"
import { SpotifyApiError } from "@/lib/catalog/spotify/client"
import { createClient } from "@/lib/supabase/server"

async function enrichImportPayload(
  supabase: Awaited<ReturnType<typeof createClient>>,
  payload: Awaited<ReturnType<typeof buildMergedCatalogImportFromSpotifyAlbumId>>
) {
  const artist = await buildArtistImportPreview(supabase, payload.release)
  const existingAlbumId = await findExistingAlbumId(supabase, {
    spotifyAlbumId: payload.release.spotifyAlbumId,
    discogsReleaseId: payload.release.discogsReleaseId,
    musicbrainzReleaseId: payload.release.musicbrainzReleaseId,
  })
  return { ...payload, artist, existingAlbumId }
}

export async function GET(request: Request) {
  try {
    const session = await getAuthenticatedUser()
    if (!session) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const spotifyAlbumId = searchParams.get("spotifyAlbum")?.trim() ?? ""
    const discogsMasterId = Number(searchParams.get("discogsMaster"))
    const discogsReleaseId = Number(searchParams.get("discogsRelease"))
    const musicbrainzReleaseGroupId =
      searchParams.get("musicbrainzReleaseGroup")?.trim() ?? ""

    const supabase = await createClient()

    if (spotifyAlbumId) {
      const payload = await buildMergedCatalogImportFromSpotifyAlbumId(
        spotifyAlbumId,
        musicbrainzReleaseGroupId || null
      )
      return NextResponse.json(await enrichImportPayload(supabase, payload))
    }

    if (Number.isFinite(discogsMasterId) && discogsMasterId > 0) {
      const payload = await buildMergedCatalogImportFromDiscogsMasterId(
        discogsMasterId,
        musicbrainzReleaseGroupId || null
      )
      return NextResponse.json(await enrichImportPayload(supabase, payload))
    }

    if (Number.isFinite(discogsReleaseId) && discogsReleaseId > 0) {
      const payload = await buildMergedCatalogImportFromDiscogsReleaseId(
        discogsReleaseId,
        musicbrainzReleaseGroupId || null
      )
      return NextResponse.json(await enrichImportPayload(supabase, payload))
    }

    if (musicbrainzReleaseGroupId) {
      const payload =
        await buildMergedCatalogImportFromMusicBrainzReleaseGroupId(
          musicbrainzReleaseGroupId
        )
      return NextResponse.json(await enrichImportPayload(supabase, payload))
    }

    return NextResponse.json(
      { error: "Paramètre d'import invalide." },
      { status: 400 }
    )
  } catch (error) {
    if (
      error instanceof DiscogsApiError ||
      error instanceof MusicBrainzApiError ||
      error instanceof SpotifyApiError
    ) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(
      { error: "Impossible d'importer la référence." },
      { status: 500 }
    )
  }
}
