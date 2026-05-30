import { discogsFetch } from "@/lib/catalog/discogs/client"
import { mapDiscogsRelease } from "@/lib/catalog/discogs/map-release"
import { pickBestDiscogsReleaseIdForMaster } from "@/lib/catalog/discogs/pick-best-release"
import type { CatalogReleaseImport } from "@/lib/catalog/discogs/types"
import {
  catalogImportSources,
  mergeCatalogImports,
} from "@/lib/catalog/merge-catalog-import"
import { findMusicBrainzRelease } from "@/lib/catalog/musicbrainz/find-release"
import { musicBrainzFetch } from "@/lib/catalog/musicbrainz/client"
import {
  lookupMusicBrainzReleaseById,
  pickBestMusicBrainzReleaseIdForGroup,
} from "@/lib/catalog/musicbrainz/pick-best-release"
import type { MusicBrainzPartialImport } from "@/lib/catalog/musicbrainz/types"

async function enrichWithMusicBrainz(
  discogsImport: CatalogReleaseImport,
  musicbrainzReleaseGroupId?: string | null
): Promise<MusicBrainzPartialImport | null> {
  if (musicbrainzReleaseGroupId) {
    try {
      const picked = await pickBestMusicBrainzReleaseIdForGroup(
        musicbrainzReleaseGroupId
      )
      return lookupMusicBrainzReleaseById(picked.releaseId)
    } catch {
      // Fallback to heuristic search below.
    }
  }

  try {
    return await findMusicBrainzRelease({
      title: discogsImport.title,
      artist: discogsImport.artist,
      releaseYear: discogsImport.releaseYear,
      discogsReleaseId: discogsImport.discogsReleaseId ?? 0,
      barcode: discogsImport.barcode,
    })
  } catch {
    return null
  }
}

async function findDiscogsReleaseIdFromMusicBrainzRelease(releaseId: string) {
  const data = await musicBrainzFetch<{
    relations?: { url?: { resource?: string } }[]
  }>({
    path: `/release/${releaseId}`,
    searchParams: { inc: "url-rels" },
  })

  for (const relation of data.relations ?? []) {
    const resource = relation.url?.resource ?? ""
    const match = resource.match(/discogs\.com\/release\/(\d+)/i)
    if (match?.[1]) return Number(match[1])
  }

  return null
}

async function findDiscogsReleaseIdByBarcode(barcode: string) {
  const data = await discogsFetch<{ results?: { type?: string; id?: number }[] }>({
    path: "/database/search",
    searchParams: { barcode, type: "release", per_page: 1 },
  })

  const hit = data.results?.find((item) => item.type === "release" && item.id)
  return hit?.id ?? null
}

function musicBrainzOnlyImport(
  musicbrainzImport: MusicBrainzPartialImport
): CatalogReleaseImport {
  return {
    discogsReleaseId: null,
    musicbrainzReleaseId: musicbrainzImport.musicbrainzReleaseId,
    barcode: musicbrainzImport.barcode,
    title: musicbrainzImport.title,
    artist: musicbrainzImport.artist,
    releaseYear: musicbrainzImport.releaseYear,
    releaseDate: musicbrainzImport.releaseDate,
    genre: musicbrainzImport.genre,
    subgenre: musicbrainzImport.subgenre,
    label: musicbrainzImport.label,
    recordCompany: musicbrainzImport.recordCompany,
    producers: musicbrainzImport.producers,
    country: musicbrainzImport.country,
    description: musicbrainzImport.description,
    trackCount: musicbrainzImport.trackCount,
    coverUrl: musicbrainzImport.coverUrl,
    certification: "",
  }
}

export async function buildMergedCatalogImportFromDiscogsReleaseId(
  releaseId: number,
  musicbrainzReleaseGroupId?: string | null
) {
  const discogsRaw = await discogsFetch<unknown>({
    path: `/releases/${releaseId}`,
  })
  const discogsImport = mapDiscogsRelease(discogsRaw)
  const musicbrainzImport = await enrichWithMusicBrainz(
    discogsImport,
    musicbrainzReleaseGroupId
  )

  return {
    release: mergeCatalogImports(discogsImport, musicbrainzImport),
    sources: catalogImportSources(musicbrainzImport),
    variantCount: null as number | null,
  }
}

export async function buildMergedCatalogImportFromDiscogsMasterId(
  masterId: number,
  musicbrainzReleaseGroupId?: string | null
) {
  const picked = await pickBestDiscogsReleaseIdForMaster(masterId)
  const merged = await buildMergedCatalogImportFromDiscogsReleaseId(
    picked.releaseId,
    musicbrainzReleaseGroupId
  )

  return {
    ...merged,
    variantCount: picked.variantCount,
  }
}

export async function buildMergedCatalogImportFromMusicBrainzReleaseGroupId(
  groupId: string
) {
  const picked = await pickBestMusicBrainzReleaseIdForGroup(groupId)
  const musicbrainzImport = await lookupMusicBrainzReleaseById(picked.releaseId)

  let discogsReleaseId = await findDiscogsReleaseIdFromMusicBrainzRelease(
    picked.releaseId
  )

  if (!discogsReleaseId && musicbrainzImport.barcode) {
    discogsReleaseId = await findDiscogsReleaseIdByBarcode(musicbrainzImport.barcode)
  }

  if (!discogsReleaseId) {
    return {
      release: mergeCatalogImports(
        musicBrainzOnlyImport(musicbrainzImport),
        musicbrainzImport
      ),
      sources: { discogs: false, musicbrainz: true },
      variantCount: picked.variantCount,
    }
  }

  const discogsRaw = await discogsFetch<unknown>({
    path: `/releases/${discogsReleaseId}`,
  })
  const discogsImport = mapDiscogsRelease(discogsRaw)

  return {
    release: mergeCatalogImports(discogsImport, musicbrainzImport),
    sources: catalogImportSources(musicbrainzImport),
    variantCount: picked.variantCount,
  }
}
