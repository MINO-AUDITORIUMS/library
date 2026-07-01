export function isSpotifyOnlyCatalogImport() {
  return process.env.CATALOG_IMPORT_SPOTIFY_ONLY?.trim() === "true"
}
