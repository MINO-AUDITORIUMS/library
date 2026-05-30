import type { CatalogReleaseImport } from "@/lib/catalog/discogs/types"

type RawRelease = {
  id: number
  title?: string
  year?: number
  released?: string
  country?: string
  notes?: string
  genres?: string[]
  styles?: string[]
  artists?: { id?: number; name?: string; role?: string }[]
  labels?: { name: string; catno?: string }[]
  tracklist?: { position: string; title: string; duration?: string }[]
  images?: { type: string; uri: string; resource_url: string }[]
  extraartists?: { name: string; role?: string }[]
  identifiers?: { type?: string; value?: string }[]
}

function primaryDiscogsArtist(release: RawRelease) {
  const main =
    release.artists?.find(
      (artist) => !artist.role || artist.role.toLowerCase() === "main"
    ) ?? release.artists?.[0]

  return {
    discogsArtistId:
      typeof main?.id === "number" && main.id > 0 ? main.id : null,
    name: main?.name?.trim() ?? "",
  }
}

function mapProducers(release: RawRelease) {
  const credits = release.extraartists ?? []
  const producers = credits
    .filter((a) => a.role?.toLowerCase().includes("produc"))
    .map((a) => a.name)
  return producers.length > 0 ? producers.join(", ") : ""
}

function coverUrl(release: RawRelease) {
  const primary =
    release.images?.find((img) => img.type === "primary") ?? release.images?.[0]
  return primary?.uri ?? primary?.resource_url ?? null
}

function readBarcode(release: RawRelease) {
  const match = (release.identifiers ?? []).find((identifier) =>
    identifier.type?.toLowerCase().includes("barcode")
  )
  return match?.value?.trim() || null
}

export function mapDiscogsRelease(data: unknown): CatalogReleaseImport {
  const release = data as RawRelease
  const title = release.title ?? ""
  const artist = primaryDiscogsArtist(release)

  return {
    discogsReleaseId: release.id,
    musicbrainzReleaseId: null,
    barcode: readBarcode(release),
    title: title.replace(/\s*\(\d+\)\s*$/, "").trim() || title,
    artist: artist.name,
    discogsArtistId: artist.discogsArtistId,
    musicbrainzArtistId: null,
    releaseYear: release.year ? String(release.year) : "",
    releaseDate: release.released ?? "",
    genre: release.genres?.[0] ?? "",
    subgenre: release.styles?.[0] ?? "",
    label: release.labels?.[0]?.name ?? "",
    recordCompany: release.labels?.[0]?.name ?? "",
    producers: mapProducers(release),
    country: release.country ?? "",
    description: release.notes?.trim() ?? "",
    trackCount: release.tracklist?.length ? String(release.tracklist.length) : "",
    coverUrl: coverUrl(release),
    certification: "",
  }
}
