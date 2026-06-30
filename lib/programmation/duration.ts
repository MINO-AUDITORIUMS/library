export function minutesFromSeconds(totalSeconds: number) {
  if (totalSeconds <= 0) return 40
  return Math.max(1, Math.round(totalSeconds / 60))
}

export function parseTimeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0
  return hours * 60 + minutes
}

export function formatMinutesAsTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
}

export function snapMinutes(totalMinutes: number, snap = 15) {
  return Math.round(totalMinutes / snap) * snap
}

export function formatListeningDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes} min`
  if (minutes === 0) return `${hours}h`
  return `${hours}h${String(minutes).padStart(2, "0")}`
}
