export function formatDuration(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function formatTrackDuration(seconds: number | null) {
  if (seconds == null) return "—"
  return formatDuration(seconds)
}

export function formatCommentDate(iso: string) {
  const date = new Date(iso)
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}
