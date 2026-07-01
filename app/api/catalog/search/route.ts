import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import { discogsFetch, DiscogsApiError } from "@/lib/catalog/discogs/client"
import { mapDiscogsMasterSearchResponse } from "@/lib/catalog/discogs/map-search"
import type { DiscogsSearchResponse } from "@/lib/catalog/discogs/types"
import { isSpotifyOnlyCatalogImport } from "@/lib/catalog/import-flags"
import { mergeCatalogSearchResults } from "@/lib/catalog/merge-catalog-search"
import { searchMusicBrainzReleaseGroups } from "@/lib/catalog/musicbrainz/search-release-groups"
import { MusicBrainzApiError } from "@/lib/catalog/musicbrainz/client"
import { searchSpotifyAlbums } from "@/lib/catalog/spotify/search-albums"
import { SpotifyApiError } from "@/lib/catalog/spotify/client"

function escapeLucene(value: string) {
  return value.replace(/[+\-&|!(){}[\]^"~*?:\\/]/g, "\\$&")
}

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

    const albumQuery = `(${escapeLucene(q)}) AND primarytype:album`
    const spotifyOnly = isSpotifyOnlyCatalogImport()

    const [spotifyResults, discogsData, musicBrainzResults] = await Promise.all([
      searchSpotifyAlbums(q).catch(() => []),
      spotifyOnly
        ? Promise.resolve(null)
        : discogsFetch<DiscogsSearchResponse>({
            path: "/database/search",
            searchParams: {
              q,
              type: "master",
              per_page: 10,
            },
          }).catch(() => null),
      spotifyOnly
        ? Promise.resolve([])
        : (async () => {
            let results = await searchMusicBrainzReleaseGroups(albumQuery).catch(
              () => []
            )
            if (results.length === 0) {
              results = await searchMusicBrainzReleaseGroups(escapeLucene(q)).catch(
                () => []
              )
            }
            return results
          })(),
    ])

    const discogsResults = discogsData
      ? mapDiscogsMasterSearchResponse(discogsData)
      : []

    const results = mergeCatalogSearchResults([
      ...spotifyResults,
      ...discogsResults,
      ...musicBrainzResults,
    ])

    return NextResponse.json({ results })
  } catch (error) {
    if (
      error instanceof DiscogsApiError ||
      error instanceof MusicBrainzApiError ||
      error instanceof SpotifyApiError
    ) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    return NextResponse.json(
      { error: "Impossible de lancer la recherche catalogue." },
      { status: 500 }
    )
  }
}
