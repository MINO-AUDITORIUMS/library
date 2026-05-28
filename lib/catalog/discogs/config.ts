export function getDiscogsConfig() {
  const token = process.env.DISCOGS_TOKEN?.trim()
  const consumerKey = process.env.DISCOGS_CONSUMER_KEY?.trim()
  const consumerSecret = process.env.DISCOGS_CONSUMER_SECRET?.trim()
  const userAgent =
    process.env.DISCOGS_USER_AGENT?.trim() ?? "MINO-Library/1.0 +https://mino.co"

  const hasToken = Boolean(token)
  const hasKeyPair = Boolean(consumerKey && consumerSecret)

  return {
    token,
    consumerKey,
    consumerSecret,
    userAgent,
    isConfigured: hasToken || hasKeyPair,
    authMode: hasToken ? ("token" as const) : hasKeyPair ? ("key" as const) : null,
  }
}
