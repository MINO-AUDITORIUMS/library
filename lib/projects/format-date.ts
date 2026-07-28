import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"

export function formatProjectDate(value: string | null) {
  if (!value) return null
  try {
    return format(parseISO(value), "d MMM yyyy", { locale: fr })
  } catch {
    return value
  }
}

export function formatProjectDateRange(
  start: string | null,
  end: string | null
) {
  const startLabel = formatProjectDate(start)
  const endLabel = formatProjectDate(end)
  if (startLabel && endLabel && start !== end) {
    return `${startLabel} → ${endLabel}`
  }
  return startLabel
}
