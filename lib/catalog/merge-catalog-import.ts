import { pickMergedCountry } from "@/lib/catalog/country-code"
import { stripCatalogDisambiguation } from "@/lib/catalog/normalize-artist-name"
import type { CatalogReleaseImport } from "@/lib/catalog/discogs/types"
import { parseCertificationFromText } from "@/lib/catalog/parse-certification"
import type { MusicBrainzPartialImport } from "@/lib/catalog/musicbrainz/types"

function pickPrimary(preferred: string, fallback: string) {
  const primary = preferred.trim()
  if (primary) return primary
  return fallback.trim()
}

function pickDiscogsFirst(discogs: string, musicbrainz: string) {
  return pickPrimary(discogs, musicbrainz)
}

function pickMusicBrainzFirst(musicbrainz: string, discogs: string) {
  return pickPrimary(musicbrainz, discogs)
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

function pickTrackCount(discogs: string, musicbrainz: string) {
  const discogsCount = Number.parseInt(discogs, 10)
  const mbCount = Number.parseInt(musicbrainz, 10)
  const best = Math.max(
    Number.isFinite(discogsCount) ? discogsCount : 0,
    Number.isFinite(mbCount) ? mbCount : 0
  )
  return best > 0 ? String(best) : pickPrimary(discogs, musicbrainz)
}

function pickCoverUrl(
  discogs: string | null,
  musicbrainz: string | null
) {
  if (discogs?.trim()) return discogs.trim()
  if (musicbrainz?.trim()) return musicbrainz.trim()
  return null
}

function mergeDescription(discogs: string, musicbrainz: string) {
  const discogsText = discogs.trim()
  const mbText = musicbrainz.trim()
  if (discogsText && mbText && discogsText !== mbText) {
    return `${discogsText}\n\n${mbText}`
  }
  return pickPrimary(discogsText, mbText)
}

export type CatalogImportSources = {
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
  }
}

export function mergeCatalogImports(
  discogs: CatalogReleaseImport,
  musicbrainz: MusicBrainzPartialImport | null
): CatalogReleaseImport {
  if (!musicbrainz) {
    return withNormalizedNames({
      ...discogs,
      country: pickMergedCountry(discogs.country, ""),
      certification: parseCertificationFromText(discogs.description),
    })
  }

  return withNormalizedNames({
    discogsReleaseId: discogs.discogsReleaseId,
    musicbrainzReleaseId: musicbrainz.musicbrainzReleaseId,
    barcode: discogs.barcode ?? musicbrainz.barcode,
    title: pickMusicBrainzFirst(musicbrainz.title, discogs.title),
    artist: pickMusicBrainzFirst(musicbrainz.artist, discogs.artist),
    releaseYear: pickMusicBrainzFirst(musicbrainz.releaseYear, discogs.releaseYear),
    releaseDate: pickMusicBrainzFirst(musicbrainz.releaseDate, discogs.releaseDate),
    genre: pickDiscogsFirst(discogs.genre, musicbrainz.genre),
    subgenre: pickDiscogsFirst(discogs.subgenre, musicbrainz.subgenre),
    label: pickMusicBrainzFirst(musicbrainz.label, discogs.label),
    recordCompany: pickDiscogsFirst(discogs.recordCompany, musicbrainz.recordCompany),
    producers: pickMusicBrainzFirst(musicbrainz.producers, discogs.producers),
    country: pickMergedCountry(discogs.country, musicbrainz.country),
    discogsArtistId: pickDiscogsFirstId(discogs.discogsArtistId, musicbrainz.discogsArtistId),
    musicbrainzArtistId: pickMusicBrainzFirstId(
      musicbrainz.musicbrainzArtistId,
      discogs.musicbrainzArtistId
    ),
    description: mergeDescription(discogs.description, musicbrainz.description),
    trackCount: pickTrackCount(discogs.trackCount, musicbrainz.trackCount),
    coverUrl: pickCoverUrl(discogs.coverUrl, musicbrainz.coverUrl),
    certification: parseCertificationFromText(
      [discogs.description, musicbrainz.description].join("\n")
    ),
  })
}

export function catalogImportSources(
  musicbrainz: MusicBrainzPartialImport | null
): CatalogImportSources {
  return {
    discogs: true,
    musicbrainz: Boolean(musicbrainz),
  }
}
