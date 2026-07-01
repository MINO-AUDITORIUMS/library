export function getSpotifyConfig() {
  const clientId = process.env.SPOTIFY_CLIENT_ID?.trim() ?? ""
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim() ?? ""

  return {
    clientId,
    clientSecret,
    isConfigured: clientId.length > 0 && clientSecret.length > 0,
  }
}
