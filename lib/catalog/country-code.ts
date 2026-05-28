const COUNTRY_NAME_TO_CODE: Record<string, string> = {
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
  allemagne: "DE",
  germany: "DE",
  japon: "JP",
  japan: "JP",
  canada: "CA",
  belgique: "BE",
  belgium: "BE",
  suisse: "CH",
  switzerland: "CH",
}

export function resolveCountryCode(country: string) {
  const trimmed = country.trim()
  if (!trimmed) return null
  if (/^[a-z]{2}$/i.test(trimmed)) return trimmed.toUpperCase()
  return COUNTRY_NAME_TO_CODE[trimmed.toLowerCase()] ?? null
}
