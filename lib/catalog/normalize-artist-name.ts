const DISCOGS_NAME_DISAMBIGUATION = /\s+\(\d+\)$/

export function normalizeArtistDisplayName(name: string) {
  return name.replace(DISCOGS_NAME_DISAMBIGUATION, "").trim()
}
