import { discogsFetch } from "@/lib/catalog/discogs/client"
import type { DiscogsCommunityStats } from "@/lib/catalog/discogs/types"

type RawCommunity = {
  have?: number
  want?: number
  rating?: {
    average?: number
    count?: number
  }
}

type RawReleaseCommunity = {
  community?: RawCommunity
}

export function mapDiscogsCommunityStats(
  data: unknown
): DiscogsCommunityStats | null {
  const community = (data as RawReleaseCommunity).community
  if (!community) return null

  const average = community.rating?.average
  const count = community.rating?.count ?? 0
  const inCollection = community.have ?? 0
  const inWantlist = community.want ?? 0

  if (
    average == null &&
    count === 0 &&
    inCollection === 0 &&
    inWantlist === 0
  ) {
    return null
  }

  return {
    averageRating: typeof average === "number" ? average : 0,
    ratingCount: count,
    inCollection,
    inWantlist,
  }
}

export async function fetchDiscogsCommunityStats(releaseId: number) {
  const data = await discogsFetch<unknown>({
    path: `/releases/${releaseId}`,
  })
  return mapDiscogsCommunityStats(data)
}
