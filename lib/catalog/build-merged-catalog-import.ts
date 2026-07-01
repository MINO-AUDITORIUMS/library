import { discogsFetch } from "@/lib/catalog/discogs/client"
import { mapDiscogsRelease } from "@/lib/catalog/discogs/map-release"
import { pickBestDiscogsReleaseIdForMaster } from "@/lib/catalog/discogs/pick-best-release"
import type { CatalogReleaseImport } from "@/lib/catalog/discogs/types"
import { isSpotifyOnlyCatalogImport } from "@/lib/catalog/import-flags"
import { findDiscogsReleaseImport } from "@/lib/catalog/link-discogs-release"
import {
  catalogImportSources,
  mergeCatalogImports,
  mergeCatalogImportsFromSources,
} from "@/lib/catalog/merge-catalog-import"
import { findMusicBrainzRelease } from "@/lib/catalog/musicbrainz/find-release"
import { musicBrainzFetch } from "@/lib/catalog/musicbrainz/client"
import {
  lookupMusicBrainzReleaseById,
  pickBestMusicBrainzReleaseIdForGroup,
} from "@/lib/catalog/musicbrainz/pick-best-release"
import type { MusicBrainzPartialImport } from "@/lib/catalog/musicbrainz/types"
import { fetchSpotifyAlbum } from "@/lib/catalog/spotify/fetch-album"

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

async function enrichWithMusicBrainzFromSpotify(input: {
  title: string
  artist: string
  releaseYear: string
  barcode: string | null
  musicbrainzReleaseGroupId?: string | null
}) {
  if (input.musicbrainzReleaseGroupId) {
    try {
      const picked = await pickBestMusicBrainzReleaseIdForGroup(
        input.musicbrainzReleaseGroupId
      )
      return lookupMusicBrainzReleaseById(picked.releaseId)
    } catch {
    }
  }

  try {
    return await findMusicBrainzRelease({
      title: input.title,
      artist: input.artist,
      releaseYear: input.releaseYear,
      discogsReleaseId: 0,
      barcode: input.barcode,
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
    spotifyAlbumId: null,
    spotifyArtistId: null,
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
    discogsArtistId: musicbrainzImport.discogsArtistId,
    musicbrainzArtistId: musicbrainzImport.musicbrainzArtistId,
    description: musicbrainzImport.description,
    trackCount: musicbrainzImport.trackCount,
    coverUrl: musicbrainzImport.coverUrl,
    certification: "",
  }
}

export async function buildMergedCatalogImportFromSpotifyAlbumId(
  spotifyAlbumId: string,
  musicbrainzReleaseGroupId?: string | null
) {
  const spotifyImport = await fetchSpotifyAlbum(spotifyAlbumId)

  if (isSpotifyOnlyCatalogImport()) {
    return {
      release: mergeCatalogImportsFromSources({
        spotify: spotifyImport,
        discogs: null,
        musicbrainz: null,
      }),
      sources: catalogImportSources({
        spotify: true,
        discogs: false,
      }),
      variantCount: null as number | null,
    }
  }

  const [discogsImport, musicbrainzImport] = await Promise.all([
    findDiscogsReleaseImport(
      spotifyImport.title,
      spotifyImport.artist,
      spotifyImport.barcode
    ).catch(() => null),
    enrichWithMusicBrainzFromSpotify({
      title: spotifyImport.title,
      artist: spotifyImport.artist,
      releaseYear: spotifyImport.releaseYear,
      barcode: spotifyImport.barcode,
      musicbrainzReleaseGroupId,
    }),
  ])

  return {
    release: mergeCatalogImportsFromSources({
      spotify: spotifyImport,
      discogs: discogsImport,
      musicbrainz: musicbrainzImport,
    }),
    sources: catalogImportSources({
      spotify: true,
      discogs: Boolean(discogsImport),
      musicbrainz: musicbrainzImport,
    }),
    variantCount: null as number | null,
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
    sources: catalogImportSources({
      discogs: true,
      musicbrainz: musicbrainzImport,
    }),
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
      sources: catalogImportSources({
        discogs: false,
        musicbrainz: musicbrainzImport,
      }),
      variantCount: picked.variantCount,
    }
  }

  const discogsRaw = await discogsFetch<unknown>({
    path: `/releases/${discogsReleaseId}`,
  })
  const discogsImport = mapDiscogsRelease(discogsRaw)

  return {
    release: mergeCatalogImports(discogsImport, musicbrainzImport),
    sources: catalogImportSources({
      discogs: true,
      musicbrainz: musicbrainzImport,
    }),
    variantCount: picked.variantCount,
  }
}
