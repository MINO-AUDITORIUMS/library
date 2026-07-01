import { discogsFetch } from "@/lib/catalog/discogs/client"
import { mapDiscogsRelease } from "@/lib/catalog/discogs/map-release"
import { pickBestDiscogsReleaseIdForMaster } from "@/lib/catalog/discogs/pick-best-release"
import type { CatalogReleaseImport } from "@/lib/catalog/discogs/types"
import { stripCatalogDisambiguation } from "@/lib/catalog/normalize-artist-name"

function normalizeToken(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
}

function scoreDiscogsMasterHit(
  title: string,
  artist: string,
  hitTitle: string
) {
  const expectedArtist = normalizeToken(artist)
  const expectedTitle = normalizeToken(title)
  const normalizedHit = normalizeToken(hitTitle)

  let score = 0
  if (expectedTitle && normalizedHit.includes(expectedTitle)) score += 3
  if (expectedArtist && normalizedHit.includes(expectedArtist)) score += 2
  return score
}

async function searchDiscogsMasterId(title: string, artist: string) {
  const q = `${artist} ${title}`.trim()
  const data = await discogsFetch<{
    results?: { id?: number; type?: string; title?: string }[]
  }>({
    path: "/database/search",
    searchParams: { q, type: "master", per_page: 8 },
  })

  const candidates = (data.results ?? []).filter(
    (item) => item.type === "master" && item.id
  )

  if (candidates.length === 0) return null

  const ranked = candidates
    .map((item) => ({
      id: item.id as number,
      score: scoreDiscogsMasterHit(title, artist, item.title ?? ""),
    }))
    .sort((a, b) => b.score - a.score)

  return ranked[0]?.score > 0 ? ranked[0].id : candidates[0]?.id ?? null
}

export async function findDiscogsReleaseImport(
  title: string,
  artist: string,
  barcode?: string | null
): Promise<CatalogReleaseImport | null> {
  if (barcode?.trim()) {
    const barcodeHit = await discogsFetch<{
      results?: { type?: string; id?: number }[]
    }>({
      path: "/database/search",
      searchParams: { barcode: barcode.trim(), type: "release", per_page: 1 },
    }).catch(() => null)

    const releaseId = barcodeHit?.results?.find(
      (item) => item.type === "release" && item.id
    )?.id

    if (releaseId) {
      const raw = await discogsFetch<unknown>({
        path: `/releases/${releaseId}`,
      })
      return mapDiscogsRelease(raw)
    }
  }

  const masterId = await searchDiscogsMasterId(
    stripCatalogDisambiguation(title),
    stripCatalogDisambiguation(artist)
  ).catch(() => null)

  if (!masterId) return null

  const picked = await pickBestDiscogsReleaseIdForMaster(masterId)
  const raw = await discogsFetch<unknown>({
    path: `/releases/${picked.releaseId}`,
  })
  return mapDiscogsRelease(raw)
}
