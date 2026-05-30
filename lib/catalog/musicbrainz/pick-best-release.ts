import { musicBrainzFetch } from "@/lib/catalog/musicbrainz/client"
import { mapMusicBrainzRelease } from "@/lib/catalog/musicbrainz/map-release"
import type { MusicBrainzRelease } from "@/lib/catalog/musicbrainz/types"

function scoreMusicBrainzReleaseSummary(release: MusicBrainzRelease) {
  let score = 0
  if (release.country?.trim()) score += 4
  if (release.barcode?.trim()) score += 4
  if (release["label-info"]?.[0]?.label?.name?.trim()) score += 3
  if (release.date?.trim()) score += 2
  if (release.status?.toLowerCase() === "official") score += 3
  const trackCount = release.media?.reduce(
    (sum, medium) => sum + (medium["track-count"] ?? medium.tracks?.length ?? 0),
    0
  )
  if (trackCount && trackCount > 0) score += 3
  if (release.tags?.length || release["release-group"]?.tags?.length) score += 2
  return score
}

export async function pickBestMusicBrainzReleaseIdForGroup(groupId: string) {
  const data = await musicBrainzFetch<{ releases: MusicBrainzRelease[] }>({
    path: "/release",
    searchParams: {
      "release-group": groupId,
      limit: 25,
      inc: "media+labels+tags+release-groups",
    },
  })

  const releases = data.releases ?? []
  if (releases.length === 0) {
    throw new Error("Aucune release MusicBrainz trouvée pour cette référence.")
  }

  let best = releases[0]
  let bestScore = -1

  for (const release of releases) {
    const score = scoreMusicBrainzReleaseSummary(release)
    if (score > bestScore) {
      bestScore = score
      best = release
    }
  }

  return {
    releaseId: best.id,
    variantCount: releases.length,
    partial: mapMusicBrainzRelease(best),
  }
}

export async function lookupMusicBrainzReleaseById(releaseId: string) {
  const data = await musicBrainzFetch<MusicBrainzRelease>({
    path: `/release/${releaseId}`,
    searchParams: {
      inc: "artist-credits+labels+recordings+media+release-groups+tags+url-rels+artist-rels+annotation",
    },
  })
  return mapMusicBrainzRelease(data)
}
