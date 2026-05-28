import type {
  LegacyDiscogsSearchHit,
  DiscogsSearchResponse,
  DiscogsSearchType,
} from "@/lib/catalog/discogs/types"

type RawSearchResult = {
  id: number
  type: string
  title?: string
  year?: string
  label?: string[]
  thumb?: string
  resource_url?: string
  country?: string
  format?: string[]
  genre?: string[]
  style?: string[]
}

function buildSubtitle(item: RawSearchResult) {
  const parts: string[] = []
  if (item.type === "release" || item.type === "master") {
    if (item.label?.[0]) parts.push(item.label[0])
    if (item.format?.[0]) parts.push(item.format[0])
    if (item.country) parts.push(item.country)
  }
  if (item.type === "artist" && item.genre?.[0]) parts.push(item.genre[0])
  if (item.type === "label" && item.country) parts.push(item.country)
  return parts.join(" · ")
}

function parseDiscogsMasterTitle(title: string) {
  const separator = title.indexOf(" - ")
  if (separator === -1) {
    return { artist: "", albumTitle: title.trim() }
  }
  return {
    artist: title.slice(0, separator).trim(),
    albumTitle: title.slice(separator + 3).trim(),
  }
}

export function mapDiscogsMasterSearchResponse(
  data: DiscogsSearchResponse
) {
  const raw = data as unknown as {
    results?: {
      id: number
      type: string
      title?: string
      year?: string
      label?: string[]
      thumb?: string
      country?: string
      format?: string[]
    }[]
  }

  return (raw.results ?? [])
    .filter((item) => item.type === "master")
    .slice(0, 10)
    .map((item) => {
      const parsed = parseDiscogsMasterTitle(item.title ?? "Sans titre")
      const parts = ["Référence principale"]
      if (item.label?.[0]) parts.push(item.label[0])
      if (item.year) parts.push(item.year)

      return {
        key: `discogs-master:${item.id}`,
        title: parsed.albumTitle || item.title || "Sans titre",
        artist: parsed.artist,
        subtitle: parts.join(" · "),
        year: item.year ?? null,
        thumbUrl: item.thumb ?? null,
        variantCount: null,
        discogsMasterId: item.id,
        musicbrainzReleaseGroupId: null,
      }
    })
}

export function mapDiscogsSearchResponse(
  data: DiscogsSearchResponse,
  searchType: DiscogsSearchType
): LegacyDiscogsSearchHit[] {
  const raw = data as unknown as { results?: RawSearchResult[] }
  const results = raw.results ?? []

  return results
    .filter((item) => item.type === searchType || searchType === "release")
    .slice(0, 12)
    .map((item) => ({
      discogsId: item.id,
      type: (item.type as DiscogsSearchType) || searchType,
      title: item.title ?? "Sans titre",
      subtitle: buildSubtitle(item),
      year: item.year ?? null,
      thumbUrl: item.thumb ?? null,
    }))
}
