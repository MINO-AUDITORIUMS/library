import { musicBrainzFetch } from "@/lib/catalog/musicbrainz/client"
import type { CatalogSearchHit } from "@/lib/catalog/discogs/types"

type MusicBrainzReleaseGroupSearchResponse = {
  "release-groups": {
    id: string
    title: string
    score: string
    "first-release-date"?: string
    "primary-type"?: string
    "artist-credit"?: { artist: { name: string } }[]
  }[]
}

function parseYear(value: string | undefined) {
  if (!value) return null
  const match = value.match(/^(\d{4})/)
  return match?.[1] ?? null
}

export async function searchMusicBrainzReleaseGroups(query: string) {
  const data = await musicBrainzFetch<MusicBrainzReleaseGroupSearchResponse>({
    path: "/release-group",
    searchParams: {
      query,
      limit: 10,
    },
  })

  return (data["release-groups"] ?? [])
    .filter((group) => {
      const type = group["primary-type"]?.toLowerCase() ?? ""
      return type === "album" || type === "ep"
    })
    .map((group) => {
      const artist = group["artist-credit"]?.[0]?.artist.name ?? ""
      const year = parseYear(group["first-release-date"])
      const parts = ["Référence principale", "MusicBrainz"]
      if (year) parts.push(year)

      return {
        key: `musicbrainz-group:${group.id}`,
        title: group.title.trim(),
        artist,
        subtitle: parts.join(" · "),
        year,
        thumbUrl: null,
        variantCount: null,
        discogsMasterId: null,
        musicbrainzReleaseGroupId: group.id,
      } satisfies CatalogSearchHit
    })
}
