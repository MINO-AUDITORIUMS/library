import { pickMergedCountry } from "@/lib/catalog/country-code"
import type { CatalogReleaseImport } from "@/lib/catalog/discogs/types"
import { stripCatalogDisambiguation } from "@/lib/catalog/normalize-artist-name"
import type { MusicBrainzPartialImport } from "@/lib/catalog/musicbrainz/types"
import { parseCertificationFromText } from "@/lib/catalog/parse-certification"
import type { SpotifyPartialImport } from "@/lib/catalog/spotify/types"
import { normalizeProducersString } from "@/lib/catalog/track-credits"

function pickPrimary(...values: string[]) {
  for (const value of values) {
    const trimmed = value.trim()
    if (trimmed) return trimmed
  }
  return ""
}

function pickDiscogsFirstId(
  discogs: number | null,
  musicbrainz: number | null
) {
  if (discogs && discogs > 0) return discogs
  if (musicbrainz && musicbrainz > 0) return musicbrainz
  return null
}

function pickMusicBrainzFirstId(
  musicbrainz: string | null,
  discogs: string | null
) {
  if (musicbrainz?.trim()) return musicbrainz.trim()
  if (discogs?.trim()) return discogs.trim()
  return null
}

function pickTrackCount(...values: string[]) {
  const counts = values
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => Number.isFinite(value) && value > 0)
  if (counts.length === 0) return ""
  return String(Math.max(...counts))
}

function pickCoverUrl(
  spotify: string | null | undefined,
  discogs: string | null | undefined,
  musicbrainz: string | null | undefined
) {
  if (spotify?.trim()) return spotify.trim()
  return pickPrimary(discogs ?? "", musicbrainz ?? "") || null
}

function mergeDescription(...parts: string[]) {
  const unique = [...new Set(parts.map((part) => part.trim()).filter(Boolean))]
  return unique.join("\n\n")
}

export type CatalogImportSources = {
  spotify: boolean
  discogs: boolean
  musicbrainz: boolean
}

function withNormalizedNames(
  release: CatalogReleaseImport
): CatalogReleaseImport {
  return {
    ...release,
    title: stripCatalogDisambiguation(release.title),
    artist: stripCatalogDisambiguation(release.artist),
    label: stripCatalogDisambiguation(release.label),
    recordCompany: stripCatalogDisambiguation(release.recordCompany),
    producers: normalizeProducersString(release.producers),
  }
}

export function mergeCatalogImportsFromSources(input: {
  spotify: SpotifyPartialImport | null
  discogs: CatalogReleaseImport | null
  musicbrainz: MusicBrainzPartialImport | null
}): CatalogReleaseImport {
  const spotify = input.spotify
  const discogs = input.discogs
  const musicbrainz = input.musicbrainz

  const description = mergeDescription(
    spotify?.description ?? "",
    discogs?.description ?? "",
    musicbrainz?.description ?? ""
  )

  return withNormalizedNames({
    spotifyAlbumId: spotify?.spotifyAlbumId ?? null,
    spotifyArtistId: spotify?.spotifyArtistId ?? null,
    discogsReleaseId: discogs?.discogsReleaseId ?? null,
    musicbrainzReleaseId: musicbrainz?.musicbrainzReleaseId ?? null,
    barcode: spotify?.barcode ?? discogs?.barcode ?? musicbrainz?.barcode ?? null,
    title: pickPrimary(
      spotify?.title ?? "",
      musicbrainz?.title ?? "",
      discogs?.title ?? ""
    ),
    artist: pickPrimary(
      spotify?.artist ?? "",
      musicbrainz?.artist ?? "",
      discogs?.artist ?? ""
    ),
    releaseYear: pickPrimary(
      spotify?.releaseYear ?? "",
      musicbrainz?.releaseYear ?? "",
      discogs?.releaseYear ?? ""
    ),
    releaseDate: pickPrimary(
      spotify?.releaseDate ?? "",
      musicbrainz?.releaseDate ?? "",
      discogs?.releaseDate ?? ""
    ),
    genre: pickPrimary(discogs?.genre ?? "", musicbrainz?.genre ?? ""),
    subgenre: pickPrimary(discogs?.subgenre ?? "", musicbrainz?.subgenre ?? ""),
    label: pickPrimary(
      spotify?.label ?? "",
      musicbrainz?.label ?? "",
      discogs?.label ?? ""
    ),
    recordCompany: pickPrimary(
      discogs?.recordCompany ?? "",
      musicbrainz?.recordCompany ?? "",
      spotify?.recordCompany ?? ""
    ),
    producers: pickPrimary(
      musicbrainz?.producers ?? "",
      discogs?.producers ?? ""
    ),
    country: pickMergedCountry(
      discogs?.country ?? "",
      musicbrainz?.country ?? ""
    ),
    discogsArtistId: pickDiscogsFirstId(
      discogs?.discogsArtistId ?? null,
      musicbrainz?.discogsArtistId ?? null
    ),
    musicbrainzArtistId: pickMusicBrainzFirstId(
      musicbrainz?.musicbrainzArtistId ?? null,
      discogs?.musicbrainzArtistId ?? null
    ),
    description,
    trackCount: pickTrackCount(
      spotify?.trackCount ?? "",
      discogs?.trackCount ?? "",
      musicbrainz?.trackCount ?? ""
    ),
    coverUrl: pickCoverUrl(
      spotify?.coverUrl,
      discogs?.coverUrl,
      musicbrainz?.coverUrl
    ),
    certification: parseCertificationFromText(description),
  })
}

export function mergeCatalogImports(
  discogs: CatalogReleaseImport,
  musicbrainz: MusicBrainzPartialImport | null
): CatalogReleaseImport {
  return mergeCatalogImportsFromSources({
    spotify: null,
    discogs,
    musicbrainz,
  })
}

export function catalogImportSources(input: {
  spotify?: boolean
  discogs?: boolean
  musicbrainz?: MusicBrainzPartialImport | null
}): CatalogImportSources {
  return {
    spotify: Boolean(input.spotify),
    discogs: Boolean(input.discogs),
    musicbrainz: Boolean(input.musicbrainz),
  }
}
