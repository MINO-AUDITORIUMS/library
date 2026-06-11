import { countryDisplayName } from "@/lib/catalog/country-code"
import { stripCatalogDisambiguation } from "@/lib/catalog/normalize-artist-name"
import { normalizeProducersString } from "@/lib/catalog/track-credits"
import type {
  MusicBrainzPartialImport,
  MusicBrainzRelease,
} from "@/lib/catalog/musicbrainz/types"

function joinArtistCredit(
  credits: MusicBrainzRelease["artist-credit"] | undefined
) {
  if (!credits?.length) return ""
  return credits
    .map((credit) => `${credit.artist.name}${credit.joinphrase ?? ""}`)
    .join("")
    .trim()
}

function mapProducers(relations: MusicBrainzRelease["relations"]) {
  const names = (relations ?? [])
    .filter((relation) => {
      const type = relation.type?.toLowerCase() ?? ""
      return type.includes("producer") && relation.artist?.name
    })
    .map((relation) => relation.artist?.name ?? "")
    .filter((name) => name.length > 0)

  return [...new Set(names)].join(", ")
}

function mapTags(release: MusicBrainzRelease) {
  const groupTags = release["release-group"]?.tags ?? []
  const releaseTags = release.tags ?? []
  const merged = [...groupTags, ...releaseTags]
    .sort((a, b) => b.count - a.count)
    .map((tag) => tag.name.trim())
    .filter((name) => name.length > 0)

  return [...new Set(merged)]
}

function parseReleaseYear(date: string | undefined) {
  if (!date) return ""
  const match = date.match(/^(\d{4})/)
  return match?.[1] ?? ""
}

function normalizeReleaseDate(date: string | undefined) {
  if (!date) return ""
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date
  if (/^\d{4}-\d{2}$/.test(date)) return `${date}-01`
  if (/^\d{4}$/.test(date)) return `${date}-01-01`
  return ""
}

function trackCountFromRelease(release: MusicBrainzRelease) {
  const mediaCount = release.media?.reduce(
    (sum, medium) => sum + (medium["track-count"] ?? medium.tracks?.length ?? 0),
    0
  )
  return mediaCount && mediaCount > 0 ? String(mediaCount) : ""
}

export function coverArtArchiveUrl(releaseId: string) {
  return `https://coverartarchive.org/release/${releaseId}/front`
}

function primaryMusicBrainzArtist(release: MusicBrainzRelease) {
  const credit = release["artist-credit"]?.[0]
  const artistId = credit?.artist?.id?.trim() ?? ""
  const name = joinArtistCredit(release["artist-credit"])

  return {
    musicbrainzArtistId: artistId.length > 0 ? artistId : null,
    name,
  }
}

export function mapMusicBrainzRelease(
  release: MusicBrainzRelease
): MusicBrainzPartialImport {
  const tags = mapTags(release)
  const labelInfo = release["label-info"]?.[0]
  const labelName = labelInfo?.label?.name?.trim() ?? ""
  const descriptionParts = [release.annotation?.trim(), release.disambiguation?.trim()]
    .filter((part) => part && part.length > 0)
  const artist = primaryMusicBrainzArtist(release)

  return {
    musicbrainzReleaseId: release.id,
    title: stripCatalogDisambiguation(release.title),
    artist: stripCatalogDisambiguation(artist.name),
    discogsArtistId: null,
    musicbrainzArtistId: artist.musicbrainzArtistId,
    releaseYear: parseReleaseYear(release.date),
    releaseDate: normalizeReleaseDate(release.date),
    genre: tags[0] ?? "",
    subgenre: tags[1] ?? "",
    label: stripCatalogDisambiguation(labelName),
    recordCompany: stripCatalogDisambiguation(labelName),
    producers: normalizeProducersString(mapProducers(release.relations)),
    country: countryDisplayName(release.country ?? ""),
    description: descriptionParts.join("\n\n"),
    trackCount: trackCountFromRelease(release),
    coverUrl: coverArtArchiveUrl(release.id),
    barcode: release.barcode?.trim() || null,
  }
}
