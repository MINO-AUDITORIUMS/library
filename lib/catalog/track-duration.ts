export function formatDurationInput(seconds: number | null): string {
  if (seconds == null || seconds <= 0) return ""
  const minutes = Math.floor(seconds / 60)
  const remaining = seconds % 60
  return `${minutes}:${remaining.toString().padStart(2, "0")}`
}

export function parseDurationInput(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  if (/^\d+$/.test(trimmed)) {
    const total = Number.parseInt(trimmed, 10)
    return total > 0 ? total : null
  }

  const parts = trimmed.split(":").map((part) => Number.parseInt(part, 10))
  if (parts.some((part) => !Number.isFinite(part) || part < 0)) return null

  if (parts.length === 2) {
    const total = parts[0] * 60 + parts[1]
    return total > 0 ? total : null
  }

  if (parts.length === 3) {
    const total = parts[0] * 3600 + parts[1] * 60 + parts[2]
    return total > 0 ? total : null
  }

  return null
}
