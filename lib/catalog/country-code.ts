import {
  countryNameFromIsoCode,
  getCountryNameIndex,
  resolveCountryCodeFromNameIndex,
} from "@/lib/catalog/iso-country-codes"

const COUNTRY_ALIASES: Record<string, string> = {
  france: "FR",
  "états-unis": "US",
  "etats-unis": "US",
  usa: "US",
  us: "US",
  "united states": "US",
  "royaume-uni": "GB",
  uk: "GB",
  gb: "GB",
  "united kingdom": "GB",
  england: "GB",
  worldwide: "XW",
  world: "XW",
  monde: "XW",
  europe: "XE",
  eu: "XE",
}

const CUSTOM_COUNTRY_NAMES: Record<string, string> = {
  GB: "UK",
  XW: "Monde",
  XE: "Europe",
}

const VAGUE_COUNTRY_LABELS = new Set([
  "worldwide",
  "world",
  "monde",
  "europe",
  "eu",
  "unknown",
  "generic",
  "international",
  "unknown country",
])

export function resolveCountryCode(country: string) {
  const trimmed = country.trim()
  if (!trimmed) return null
  if (/^[a-z]{2}$/i.test(trimmed)) return trimmed.toUpperCase()

  const aliasCode = COUNTRY_ALIASES[trimmed.toLowerCase()]
  if (aliasCode) return aliasCode

  return resolveCountryCodeFromNameIndex(trimmed, getCountryNameIndex(COUNTRY_ALIASES))
}

export function isVagueCatalogCountry(country: string) {
  return VAGUE_COUNTRY_LABELS.has(country.trim().toLowerCase())
}

export function normalizeCountryLabel(country: string) {
  const trimmed = country.trim()
  if (!trimmed) return ""

  const code = resolveCountryCode(trimmed)
  if (!code) return trimmed

  return countryDisplayName(code, trimmed)
}

export function pickMergedCountry(discogs: string, musicbrainz: string) {
  const discogsValue = discogs.trim()
  const musicbrainzValue = musicbrainz.trim()

  if (discogsValue && !isVagueCatalogCountry(discogsValue)) {
    return normalizeCountryLabel(discogsValue)
  }
  if (musicbrainzValue) return normalizeCountryLabel(musicbrainzValue)
  if (discogsValue) return normalizeCountryLabel(discogsValue)
  return ""
}

export function countryDisplayName(code: string, fallbackLabel = "") {
  const normalized = code.trim().toUpperCase()
  if (!normalized) return fallbackLabel.trim()

  const custom = CUSTOM_COUNTRY_NAMES[normalized]
  if (custom) return custom

  const fromIntl = countryNameFromIsoCode(normalized, "fr")
  if (fromIntl && fromIntl !== normalized) return fromIntl

  return fallbackLabel.trim() || normalized
}

export function countryCodeDisplayName(code: string) {
  return countryDisplayName(code)
}
