import { formatListeningDuration } from "@/lib/programmation/duration"
import {
  formatDayMonth,
  formatWeekdayShort,
  isToday,
  toDateKey,
} from "@/lib/programmation/dates"
import { sessionsForDay } from "@/lib/programmation/session-stats"
import type { ProgrammationSession } from "@/lib/programmation/types"
import { cn } from "@/lib/utils"

export type DayColumnHeaderProps = {
  date: Date
  sessions: ProgrammationSession[]
}

export function DayColumnHeader({ date, sessions }: DayColumnHeaderProps) {
  const dateKey = toDateKey(date)
  const daySessions = sessionsForDay(sessions, dateKey)
  const totalMinutes = daySessions.reduce(
    (sum, session) => sum + session.durationMinutes,
    0
  )

  return (
    <div
      className={cn(
        "rounded-lg px-2 py-2 text-center",
        isToday(date) ? "bg-primary/10" : "bg-muted/30"
      )}
    >
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {formatWeekdayShort(date)}
      </p>
      <p className="text-sm font-semibold">{formatDayMonth(date)}</p>
      {totalMinutes > 0 ? (
        <p className="text-[11px] text-muted-foreground">
          {formatListeningDuration(totalMinutes)}
        </p>
      ) : null}
    </div>
  )
}
