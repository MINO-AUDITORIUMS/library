export function coverHueFromId(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) % 360
  }
  return hash
}

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
