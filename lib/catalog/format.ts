export function formatDuration(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function formatTrackDuration(seconds: number | null) {
  if (seconds == null) return "—"
  return formatDuration(seconds)
}

function parseDisplayDate(value: string) {
  const dateOnly = value.trim().slice(0, 10)
  const match = dateOnly.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return new Date(value)

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  return new Date(year, month - 1, day)
}

export function formatDisplayDate(value: string) {
  const date = parseDisplayDate(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

export function formatCommentDate(iso: string) {
  const date = new Date(iso)
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}
