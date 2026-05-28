export function coverHueFromId(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) % 360
  }
  return hash
}

export function coverImageFromExternalIds(
  externalIds: Record<string, unknown> | null | undefined
) {
  if (!externalIds) return null
  const thumb = externalIds.discogs_thumb
  return typeof thumb === "string" && thumb.length > 0 ? thumb : null
}

export function discogsIdFromExternalIds(
  externalIds: Record<string, unknown> | null | undefined
) {
  if (!externalIds) return null
  const id = externalIds.discogs
  return typeof id === "number" ? id : null
}
