export function parseDiscogsDuration(value: string | undefined) {
  if (!value?.trim()) return null
  const parts = value.trim().split(":").map((p) => Number.parseInt(p, 10))
  if (parts.some((n) => !Number.isFinite(n))) return null
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  return null
}
