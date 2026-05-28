import { parseTagNames } from "@/lib/catalog/parse-tag-names"
import type { AlbumFormat } from "@/lib/catalog/types"

const FORMATS = new Set<AlbumFormat>([
  "vinyl",
  "cd",
  "cassette",
  "digital",
  "other",
])

export type CreateAlbumInput = {
  title: string
  artist: string
  releaseYear: string
  releaseDate: string
  genre: string
  subgenre: string
  label: string
  recordCompany: string
  producers: string
  country: string
  format: string
  description: string
  personalNotes: string
  trackCount: string
  discogsReleaseId: number | null
  coverImageUrl: string | null
  tags: string[]
}

export function parseCreateAlbumInput(body: unknown): CreateAlbumInput | null {
  if (!body || typeof body !== "object") return null
  const data = body as Record<string, unknown>

  const title = typeof data.title === "string" ? data.title.trim() : ""
  const artist = typeof data.artist === "string" ? data.artist.trim() : ""
  if (!title || !artist) return null

  const discogsRaw = data.discogsReleaseId
  const discogsReleaseId =
    typeof discogsRaw === "number" && discogsRaw > 0 ? discogsRaw : null

  const coverRaw = data.coverImageUrl
  const coverImageUrl =
    typeof coverRaw === "string" && coverRaw.trim().length > 0
      ? coverRaw.trim()
      : null

  const formatRaw = typeof data.format === "string" ? data.format.trim() : ""
  const format = FORMATS.has(formatRaw as AlbumFormat)
    ? (formatRaw as AlbumFormat)
    : "other"

  return {
    title,
    artist,
    releaseYear: typeof data.releaseYear === "string" ? data.releaseYear : "",
    releaseDate: typeof data.releaseDate === "string" ? data.releaseDate : "",
    genre: typeof data.genre === "string" ? data.genre.trim() : "",
    subgenre: typeof data.subgenre === "string" ? data.subgenre.trim() : "",
    label: typeof data.label === "string" ? data.label.trim() : "",
    recordCompany:
      typeof data.recordCompany === "string" ? data.recordCompany.trim() : "",
    producers: typeof data.producers === "string" ? data.producers : "",
    country: typeof data.country === "string" ? data.country.trim() : "",
    format,
    description: typeof data.description === "string" ? data.description : "",
    personalNotes:
      typeof data.personalNotes === "string" ? data.personalNotes : "",
    trackCount: typeof data.trackCount === "string" ? data.trackCount : "",
    discogsReleaseId,
    coverImageUrl,
    tags: parseTagNames(data.tags),
  }
}

export function parseProducers(value: string) {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
}

export function parseOptionalInt(value: string) {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : null
}

export function parseReleaseDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null
}
