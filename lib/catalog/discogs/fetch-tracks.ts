import { fetchDiscogsReleaseData } from "@/lib/catalog/discogs/fetch-release"
import type { ImportedTrack } from "@/lib/catalog/track-credits"

export async function fetchDiscogsTracks(releaseId: number) {
  const { tracks } = await fetchDiscogsReleaseData(releaseId)
  return tracks
}

export type { ImportedTrack }
