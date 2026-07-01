import { stripCatalogDisambiguation } from "@/lib/catalog/normalize-artist-name"
import { parseTagNames } from "@/lib/catalog/parse-tag-names"
import { normalizeProducersString } from "@/lib/catalog/track-credits"

export type UpdateAlbumInput = {
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
  personalNotes: string
  trackCount: string
  tags: string[]
}

export function parseUpdateAlbumInput(body: unknown): UpdateAlbumInput | null {
  if (!body || typeof body !== "object") return null
  const data = body as Record<string, unknown>

  const title = stripCatalogDisambiguation(
    typeof data.title === "string" ? data.title : ""
  )
  const artist = stripCatalogDisambiguation(
    typeof data.artist === "string" ? data.artist : ""
  )
  if (!title || !artist) return null

  return {
    title,
    artist,
    releaseYear: typeof data.releaseYear === "string" ? data.releaseYear : "",
    releaseDate: typeof data.releaseDate === "string" ? data.releaseDate : "",
    genre: typeof data.genre === "string" ? data.genre.trim() : "",
    subgenre: typeof data.subgenre === "string" ? data.subgenre.trim() : "",
    label: stripCatalogDisambiguation(
      typeof data.label === "string" ? data.label : ""
    ),
    recordCompany: stripCatalogDisambiguation(
      typeof data.recordCompany === "string" ? data.recordCompany : ""
    ),
    producers:
      typeof data.producers === "string"
        ? normalizeProducersString(data.producers)
        : "",
    country: typeof data.country === "string" ? data.country.trim() : "",
    personalNotes:
      typeof data.personalNotes === "string" ? data.personalNotes : "",
    trackCount: typeof data.trackCount === "string" ? data.trackCount : "",
    tags: parseTagNames(data.tags),
  }
}
