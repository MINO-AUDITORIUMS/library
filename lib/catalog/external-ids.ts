export function discogsIdFromExternalIds(
  externalIds: Record<string, unknown> | null | undefined
) {
  if (!externalIds) return null
  const id = externalIds.discogs
  if (typeof id === "number" && id > 0) return id
  if (typeof id === "string") {
    const parsed = Number.parseInt(id, 10)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null
  }
  return null
}

export function musicbrainzIdFromExternalIds(
  externalIds: Record<string, unknown> | null | undefined
) {
  if (!externalIds) return null
  const id = externalIds.musicbrainz
  if (typeof id !== "string") return null
  const trimmed = id.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function spotifyIdFromExternalIds(
  externalIds: Record<string, unknown> | null | undefined
) {
  if (!externalIds) return null
  const id = externalIds.spotify
  if (typeof id !== "string") return null
  const trimmed = id.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function hasTrackImportSources(
  externalIds: Record<string, unknown> | null | undefined
) {
  return (
    spotifyIdFromExternalIds(externalIds) !== null ||
    discogsIdFromExternalIds(externalIds) !== null ||
    musicbrainzIdFromExternalIds(externalIds) !== null
  )
}
