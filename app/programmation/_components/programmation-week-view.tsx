"use client"

import { DayColumnBody } from "@/app/programmation/_components/day-column-body"
import { DayColumnHeader } from "@/app/programmation/_components/day-column-header"
import { ScheduleScrollShell } from "@/app/programmation/_components/schedule-scroll-shell"
import { TimeGutter } from "@/app/programmation/_components/time-gutter"
import { TIME_GUTTER_WIDTH_PX } from "@/lib/programmation/constants"
import { weekDays } from "@/lib/programmation/dates"
import type {
  PlanningDisplayMode,
  ProgrammationSession,
} from "@/lib/programmation/types"

export type ProgrammationWeekViewProps = {
  anchorDate: Date
  sessions: ProgrammationSession[]
  displayMode: PlanningDisplayMode
  onEmptySlot: (dateKey: string, startTime: string) => void
  onSelectSession: (sessionId: string) => void
  onDragSessionStart: (sessionId: string) => void
  onDeleteSession: (sessionId: string) => void
  onDropSession: (dateKey: string, offsetY: number) => void
}

export function ProgrammationWeekView({
  anchorDate,
  sessions,
  displayMode,
  onEmptySlot,
  onSelectSession,
  onDragSessionStart,
  onDeleteSession,
  onDropSession,
}: ProgrammationWeekViewProps) {
  const days = weekDays(anchorDate)
  const minWidth = TIME_GUTTER_WIDTH_PX + 7 * 128 + 6 * 12 + 24

  return (
    <ScheduleScrollShell
      minWidth={minWidth}
      header={
        <div className="flex gap-3">
          <div className="shrink-0" style={{ width: TIME_GUTTER_WIDTH_PX }} />
          <div className="grid min-w-0 flex-1 grid-cols-7 gap-3">
            {days.map((day) => (
              <DayColumnHeader
                key={day.toISOString()}
                date={day}
                sessions={sessions}
              />
            ))}
          </div>
        </div>
      }
    >
      {displayMode === "visual" ? (
        <div className="flex gap-3">
          <TimeGutter />
          <div className="grid min-w-0 flex-1 grid-cols-7 gap-3">
            {days.map((day) => (
              <DayColumnBody
                key={day.toISOString()}
                date={day}
                sessions={sessions}
                displayMode={displayMode}
                onEmptySlot={onEmptySlot}
                onSelectSession={onSelectSession}
                onDragSessionStart={onDragSessionStart}
                onDeleteSession={onDeleteSession}
                onDropSession={onDropSession}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-3">
          {days.map((day) => (
            <DayColumnBody
              key={day.toISOString()}
              date={day}
              sessions={sessions}
              displayMode={displayMode}
              onEmptySlot={onEmptySlot}
              onSelectSession={onSelectSession}
              onDragSessionStart={onDragSessionStart}
              onDeleteSession={onDeleteSession}
              onDropSession={onDropSession}
            />
          ))}
        </div>
      )}
    </ScheduleScrollShell>
  )
}
