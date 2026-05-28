export function getMusicBrainzConfig() {
  const userAgent =
    process.env.MUSICBRAINZ_USER_AGENT?.trim() ??
    "MINO-Library/1.0 (https://mino.co; contact@mino.co)"

  return { userAgent }
}
