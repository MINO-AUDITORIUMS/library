import { normalizeArtistDisplayName } from "@/lib/catalog/normalize-artist-name"

export type UpdateArtistInput = {
  name: string
  country: string
  bio: string
}

export function parseUpdateArtistInput(body: unknown): UpdateArtistInput | null {
  if (!body || typeof body !== "object") return null
  const data = body as Record<string, unknown>

  const name = normalizeArtistDisplayName(
    typeof data.name === "string" ? data.name : ""
  )
  if (!name) return null

  return {
    name,
    country: typeof data.country === "string" ? data.country.trim() : "",
    bio: typeof data.bio === "string" ? data.bio.trim() : "",
  }
}
