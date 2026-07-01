import { stripCatalogDisambiguation } from "@/lib/catalog/normalize-artist-name"
import { searchSpotifyAlbums } from "@/lib/catalog/spotify/search-albums"

function normalizeToken(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
}

function scoreSpotifyAlbumHit(
  title: string,
  artist: string,
  hitTitle: string,
  hitArtist: string
) {
  const expectedTitle = normalizeToken(title)
  const expectedArtist = normalizeToken(artist)
  const normalizedTitle = normalizeToken(hitTitle)
  const normalizedArtist = normalizeToken(hitArtist)

  let score = 0
  if (expectedTitle && normalizedTitle === expectedTitle) score += 5
  else if (expectedTitle && normalizedTitle.includes(expectedTitle)) score += 3

  if (expectedArtist && normalizedArtist === expectedArtist) score += 4
  else if (
    expectedArtist &&
    normalizedArtist.split(" ").some((part) => expectedArtist.includes(part))
  ) {
    score += 2
  }

  return score
}

export async function findSpotifyAlbumId(title: string, artist: string) {
  const trimmedTitle = stripCatalogDisambiguation(title)
  const trimmedArtist = stripCatalogDisambiguation(artist)
  if (!trimmedTitle || !trimmedArtist) return null

  const hits = await searchSpotifyAlbums(`${trimmedArtist} ${trimmedTitle}`).catch(
    () => []
  )

  if (hits.length === 0) return null

  const ranked = hits
    .filter((hit) => hit.spotifyAlbumId)
    .map((hit) => ({
      id: hit.spotifyAlbumId as string,
      score: scoreSpotifyAlbumHit(
        trimmedTitle,
        trimmedArtist,
        hit.title,
        hit.artist
      ),
    }))
    .sort((a, b) => b.score - a.score)

  if (ranked.length === 0) return null
  if (ranked[0].score < 4) return null

  return ranked[0].id
}
