import { parseTagNames } from "@/lib/catalog/parse-tag-names"

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
  description: string
  personalNotes: string
  trackCount: string
  tags: string[]
}

export function parseUpdateAlbumInput(body: unknown): UpdateAlbumInput | null {
  if (!body || typeof body !== "object") return null
  const data = body as Record<string, unknown>

  const title = typeof data.title === "string" ? data.title.trim() : ""
  const artist = typeof data.artist === "string" ? data.artist.trim() : ""
  if (!title || !artist) return null

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
    description: typeof data.description === "string" ? data.description : "",
    personalNotes:
      typeof data.personalNotes === "string" ? data.personalNotes : "",
    trackCount: typeof data.trackCount === "string" ? data.trackCount : "",
    tags: parseTagNames(data.tags),
  }
}
