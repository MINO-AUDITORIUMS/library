export function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function parseDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, month - 1, day)
}

export function startOfWeek(date: Date) {
  const result = new Date(date)
  const weekday = result.getDay()
  const diff = weekday === 0 ? -6 : 1 - weekday
  result.setDate(result.getDate() + diff)
  result.setHours(0, 0, 0, 0)
  return result
}

export function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

export function isSameDay(a: Date, b: Date) {
  return toDateKey(a) === toDateKey(b)
}

export function isToday(date: Date) {
  return isSameDay(date, new Date())
}

export function weekDays(anchor: Date) {
  const start = startOfWeek(anchor)
  return Array.from({ length: 7 }, (_, index) => addDays(start, index))
}

export function monthCalendarDays(anchor: Date) {
  const monthStart = startOfMonth(anchor)
  const monthEnd = endOfMonth(anchor)
  const gridStart = startOfWeek(monthStart)
  const gridEnd = addDays(startOfWeek(monthEnd), 6)
  const days: Date[] = []
  let cursor = gridStart

  while (cursor <= gridEnd) {
    days.push(new Date(cursor))
    cursor = addDays(cursor, 1)
  }

  return days
}

export function formatWeekdayShort(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "short" }).format(date)
}

export function formatDayMonth(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(date)
}

export function formatMonthYear(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(date)
}

export function formatDayTitle(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

export function formatWeekRange(anchor: Date) {
  const days = weekDays(anchor)
  const start = days[0]
  const end = days[6]
  const sameMonth = start.getMonth() === end.getMonth()

  if (sameMonth) {
    return `${start.getDate()} – ${formatDayMonth(end)} ${end.getFullYear()}`
  }

  return `${formatDayMonth(start)} – ${formatDayMonth(end)} ${end.getFullYear()}`
}
