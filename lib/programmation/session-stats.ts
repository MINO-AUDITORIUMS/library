import {
  addDays,
  endOfMonth,
  parseDateKey,
  startOfMonth,
  startOfWeek,
  toDateKey,
} from "@/lib/programmation/dates"
import type { PeriodSummary, PlanningView, ProgrammationSession } from "@/lib/programmation/types"

function sessionsInRange(
  sessions: ProgrammationSession[],
  startKey: string,
  endKey: string
) {
  return sessions.filter(
    (session) => session.date >= startKey && session.date <= endKey
  )
}

function summarize(sessions: ProgrammationSession[]): PeriodSummary {
  const dayMap = new Map<string, { minutes: number; count: number }>()

  for (const session of sessions) {
    const current = dayMap.get(session.date) ?? { minutes: 0, count: 0 }
    dayMap.set(session.date, {
      minutes: current.minutes + session.durationMinutes,
      count: current.count + 1,
    })
  }

  return {
    totalMinutes: sessions.reduce(
      (sum, session) => sum + session.durationMinutes,
      0
    ),
    sessionCount: sessions.length,
    dayTotals: [...dayMap.entries()]
      .map(([date, value]) => ({ date, ...value }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  }
}

export function getPeriodBounds(view: PlanningView, anchor: Date) {
  if (view === "week") {
    const start = startOfWeek(anchor)
    const end = addDays(start, 6)
    return { startKey: toDateKey(start), endKey: toDateKey(end) }
  }

  const start = startOfMonth(anchor)
  const end = endOfMonth(anchor)
  return { startKey: toDateKey(start), endKey: toDateKey(end) }
}

export function summarizePeriod(
  sessions: ProgrammationSession[],
  view: PlanningView,
  anchor: Date
): PeriodSummary {
  const { startKey, endKey } = getPeriodBounds(view, anchor)
  return summarize(sessionsInRange(sessions, startKey, endKey))
}

export function sessionsForDay(
  sessions: ProgrammationSession[],
  dateKey: string
) {
  return sessions
    .filter((session) => session.date === dateKey)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
}

export function sessionsForView(
  sessions: ProgrammationSession[],
  view: PlanningView,
  anchor: Date
) {
  const { startKey, endKey } = getPeriodBounds(view, anchor)
  return sessionsInRange(sessions, startKey, endKey).sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date)
    return a.startTime.localeCompare(b.startTime)
  })
}

export function sessionEndMinutes(session: ProgrammationSession) {
  const [hours, minutes] = session.startTime.split(":").map(Number)
  return hours * 60 + minutes + session.durationMinutes
}

export function overlapsSession(
  sessions: ProgrammationSession[],
  candidate: Pick<ProgrammationSession, "id" | "date" | "startTime" | "durationMinutes">
) {
  const [hours, minutes] = candidate.startTime.split(":").map(Number)
  const start = hours * 60 + minutes
  const end = start + candidate.durationMinutes

  return sessions.some((session) => {
    if (session.id === candidate.id || session.date !== candidate.date) return false
    const [sessionHours, sessionMinutes] = session.startTime.split(":").map(Number)
    const sessionStart = sessionHours * 60 + sessionMinutes
    const sessionEnd = sessionStart + session.durationMinutes
    return start < sessionEnd && end > sessionStart
  })
}

export function dateFromAnchor(view: PlanningView, anchor: Date, dateKey: string) {
  return parseDateKey(dateKey)
}
