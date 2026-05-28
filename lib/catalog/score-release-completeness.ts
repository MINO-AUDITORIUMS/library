import { isVagueCatalogCountry } from "@/lib/catalog/country-code"

type DiscogsVersionSummary = {
  id: number
  country?: string
  label?: string
  format?: string
  released?: string
  thumb?: string
  catno?: string
  status?: string
}

export function scoreDiscogsVersionSummary(version: DiscogsVersionSummary) {
  let score = 0
  if (version.country?.trim()) {
    score += isVagueCatalogCountry(version.country) ? 1 : 4
  }
  if (version.label?.trim()) score += 3
  if (version.format?.trim()) score += 2
  if (version.released?.trim()) score += 2
  if (version.catno?.trim()) score += 1
  if (version.thumb?.trim()) score += 1
  if (version.status?.toLowerCase() === "accepted") score += 1
  return score
}

type DiscogsReleaseRaw = {
  country?: string
  genres?: string[]
  styles?: string[]
  notes?: string
  identifiers?: { type?: string; value?: string }[]
  images?: unknown[]
  tracklist?: { title?: string; duration?: string }[]
  extraartists?: unknown[]
  labels?: { name?: string }[]
  released?: string
  year?: number
}

export function scoreDiscogsReleaseRaw(release: DiscogsReleaseRaw) {
  let score = 0
  if (release.country?.trim()) {
    score += isVagueCatalogCountry(release.country) ? 1 : 4
  }
  if (release.genres?.length) score += 3
  if (release.styles?.length) score += 3
  if (release.labels?.[0]?.name?.trim()) score += 3
  if (release.notes?.trim()) score += 2
  if (release.released?.trim() || release.year) score += 2
  if (release.identifiers?.some((id) => id.type?.toLowerCase().includes("barcode"))) {
    score += 3
  }
  if (release.images?.length) score += 2
  if (release.extraartists?.length) score += 2
  const tracks = release.tracklist ?? []
  if (tracks.length > 0) score += 3
  if (tracks.some((track) => track.duration?.trim())) score += 2
  return score
}
