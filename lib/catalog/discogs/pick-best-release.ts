import { discogsFetch } from "@/lib/catalog/discogs/client"
import { scoreDiscogsVersionSummary } from "@/lib/catalog/score-release-completeness"

type DiscogsMasterResponse = {
  main_release?: number
}

type DiscogsVersionsResponse = {
  versions?: {
    id: number
    country?: string
    label?: string
    format?: string
    released?: string
    thumb?: string
    catno?: string
    status?: string
  }[]
  pagination?: { items?: number }
}

export async function pickBestDiscogsReleaseIdForMaster(masterId: number) {
  const master = await discogsFetch<DiscogsMasterResponse>({
    path: `/masters/${masterId}`,
  })

  const mainRelease = master.main_release
  const versionsData = await discogsFetch<DiscogsVersionsResponse>({
    path: `/masters/${masterId}/versions`,
    searchParams: { per_page: 25, page: 1 },
  })

  const versions = versionsData.versions ?? []
  if (versions.length === 0) {
    if (!mainRelease) {
      throw new Error("Aucune version Discogs trouvée pour cette référence.")
    }
    return { releaseId: mainRelease, variantCount: 1 }
  }

  let bestId = mainRelease ?? versions[0].id
  let bestScore = -1

  for (const version of versions) {
    let score = scoreDiscogsVersionSummary(version)
    if (mainRelease && version.id === mainRelease) score += 5
    if (score > bestScore) {
      bestScore = score
      bestId = version.id
    }
  }

  return {
    releaseId: bestId,
    variantCount: versionsData.pagination?.items ?? versions.length,
  }
}
