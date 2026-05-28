export function uniqueCreditNames(names: string[]) {
  const seen = new Set<string>()
  const result: string[] = []

  for (const name of names) {
    const trimmed = name.trim()
    if (!trimmed) continue
    const key = trimmed.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    result.push(trimmed)
  }

  return result
}

export function isWriterCreditRole(role: string) {
  const normalized = role.trim().toLowerCase()
  return (
    normalized.includes("written") ||
    normalized === "composer" ||
    normalized === "lyricist" ||
    normalized.includes("writer")
  )
}

export function isProducerCreditRole(role: string) {
  const normalized = role.trim().toLowerCase()
  if (normalized.includes("executive")) return false
  return normalized.includes("produc")
}

export function isMusicBrainzWriterRelation(type: string) {
  const normalized = type.trim().toLowerCase()
  return (
    normalized === "writer" ||
    normalized === "composer" ||
    normalized === "lyricist"
  )
}

export function isMusicBrainzProducerRelation(type: string) {
  return type.trim().toLowerCase().includes("producer")
}

export type ImportedTrack = {
  position: number
  title: string
  duration_seconds: number | null
  writers: string[]
  producers: string[]
}

export function mergeImportTracks(
  primary: ImportedTrack[],
  secondary: ImportedTrack[]
) {
  if (primary.length === 0) return secondary
  if (secondary.length === 0) return primary

  return primary.map((track, index) => {
    const byPosition = secondary.find((item) => item.position === track.position)
    const fallback = byPosition ?? secondary[index]

    return {
      position: track.position,
      title: track.title,
      duration_seconds:
        track.duration_seconds ?? fallback?.duration_seconds ?? null,
      writers: uniqueCreditNames([
        ...(fallback?.writers ?? []),
        ...track.writers,
      ]),
      producers: uniqueCreditNames([
        ...track.producers,
        ...(fallback?.producers ?? []),
      ]),
    }
  })
}
