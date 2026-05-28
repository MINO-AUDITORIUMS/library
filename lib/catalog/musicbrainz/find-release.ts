import { musicBrainzFetch } from "@/lib/catalog/musicbrainz/client"
import { lookupMusicBrainzReleaseById } from "@/lib/catalog/musicbrainz/pick-best-release"
import type {
  MusicBrainzPartialImport,
  MusicBrainzReleaseSearchResponse,
} from "@/lib/catalog/musicbrainz/types"

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, " ").trim()
}

function escapeLucene(value: string) {
  return value.replace(/[+\-&|!(){}[\]^"~*?:\\/]/g, "\\$&")
}

function scoreCandidate(
  candidate: MusicBrainzReleaseSearchResponse["releases"][number],
  title: string,
  artist: string,
  year: string,
  discogsReleaseId: number
) {
  let score = Number.parseInt(candidate.score ?? "0", 10) || 0
  const candidateTitle = normalizeText(candidate.title)
  const candidateArtist = normalizeText(
    candidate["artist-credit"]?.map((credit) => credit.artist.name).join(" ") ?? ""
  )

  if (candidateTitle === normalizeText(title)) score += 20
  if (candidateArtist.includes(normalizeText(artist))) score += 15

  if (year && candidate.date?.startsWith(year)) score += 10

  if (discogsReleaseId > 0) {
    const discogsUrl = `discogs.com/release/${discogsReleaseId}`
    if (
      (candidate as { relations?: { url?: { resource?: string } }[] }).relations?.some(
        (relation) => relation.url?.resource?.includes(discogsUrl)
      )
    ) {
      score += 50
    }
  }

  return score
}

async function lookupReleaseById(id: string) {
  return lookupMusicBrainzReleaseById(id)
}

async function searchReleases(query: string, limit = 5) {
  const data = await musicBrainzFetch<MusicBrainzReleaseSearchResponse>({
    path: "/release",
    searchParams: { query, limit },
  })
  return data.releases ?? []
}

export async function findMusicBrainzRelease(input: {
  title: string
  artist: string
  releaseYear: string
  discogsReleaseId: number
  barcode: string | null
}): Promise<MusicBrainzPartialImport | null> {
  const title = input.title.trim()
  const artist = input.artist.trim()
  const year = input.releaseYear.trim()
  const barcode = input.barcode?.trim()

  if (barcode) {
    const byBarcode = await searchReleases(`barcode:${barcode}`, 3)
    if (byBarcode[0]?.id) {
      return lookupReleaseById(byBarcode[0].id)
    }
  }

  if (input.discogsReleaseId > 0) {
    const byDiscogsUrl = await searchReleases(
      `url:"discogs.com/release/${input.discogsReleaseId}"`,
      1
    )
    if (byDiscogsUrl[0]?.id) {
      return lookupReleaseById(byDiscogsUrl[0].id)
    }
  }

  if (!title || !artist) return null

  const queryParts = [
    `release:"${escapeLucene(title)}"`,
    `artist:"${escapeLucene(artist)}"`,
  ]
  if (year) queryParts.push(`date:${year}`)

  const candidates = await searchReleases(queryParts.join(" AND "), 8)
  if (candidates.length === 0) return null

  const ranked = candidates
    .map((candidate) => ({
      candidate,
      score: scoreCandidate(candidate, title, artist, year, input.discogsReleaseId),
    }))
    .sort((a, b) => b.score - a.score)

  const best = ranked[0]?.candidate
  if (!best?.id) return null

  return lookupReleaseById(best.id)
}
