export type ArtistExternalIds = {
  discogs?: number
  musicbrainz?: string
}

export function discogsArtistIdFromExternalIds(
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

export function musicbrainzArtistIdFromExternalIds(
  externalIds: Record<string, unknown> | null | undefined
) {
  if (!externalIds) return null
  const id = externalIds.musicbrainz
  if (typeof id !== "string") return null
  const trimmed = id.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function buildArtistExternalIds(input: {
  discogsArtistId?: number | null
  musicbrainzArtistId?: string | null
}): ArtistExternalIds {
  const externalIds: ArtistExternalIds = {}
  if (input.discogsArtistId && input.discogsArtistId > 0) {
    externalIds.discogs = input.discogsArtistId
  }
  if (input.musicbrainzArtistId?.trim()) {
    externalIds.musicbrainz = input.musicbrainzArtistId.trim()
  }
  return externalIds
}
