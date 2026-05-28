import type {
  CatalogSearchHit,
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

export function mapDiscogsSearchResponse(
  data: DiscogsSearchResponse,
  searchType: DiscogsSearchType
): CatalogSearchHit[] {
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
