const CATALOG_DISAMBIGUATION_SUFFIX = /\s+\(\d+\)$/

export function stripCatalogDisambiguation(value: string) {
  return value.replace(CATALOG_DISAMBIGUATION_SUFFIX, "").trim()
}

export function normalizeArtistDisplayName(name: string) {
  return stripCatalogDisambiguation(name)
}
