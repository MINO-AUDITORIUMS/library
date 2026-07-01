"use client"

import { DayColumnBody } from "@/app/programmation/_components/day-column-body"
import { DayColumnHeader } from "@/app/programmation/_components/day-column-header"
import { ScheduleScrollShell } from "@/app/programmation/_components/schedule-scroll-shell"
import { TimeGutter } from "@/app/programmation/_components/time-gutter"
import { TIME_GUTTER_WIDTH_PX } from "@/lib/programmation/constants"
import type {
  PlanningDisplayMode,
  ProgrammationSession,
} from "@/lib/programmation/types"

export type ProgrammationDayViewProps = {
  anchorDate: Date
  sessions: ProgrammationSession[]
  displayMode: PlanningDisplayMode
  onEmptySlot: (dateKey: string, startTime: string) => void
  onSelectSession: (sessionId: string) => void
  onDragSessionStart: (sessionId: string) => void
  onDeleteSession: (sessionId: string) => void
  onDropSession: (dateKey: string, offsetY: number) => void
}

export function ProgrammationDayView({
  anchorDate,
  sessions,
  displayMode,
  onEmptySlot,
  onSelectSession,
  onDragSessionStart,
  onDeleteSession,
  onDropSession,
}: ProgrammationDayViewProps) {
  return (
    <ScheduleScrollShell
      className="mx-auto w-full max-w-md"
      header={
        displayMode === "visual" ? (
          <div className="flex gap-3">
            <div className="shrink-0" style={{ width: TIME_GUTTER_WIDTH_PX }} />
            <div className="min-w-0 flex-1">
              <DayColumnHeader date={anchorDate} sessions={sessions} />
            </div>
          </div>
        ) : (
          <DayColumnHeader date={anchorDate} sessions={sessions} />
        )
      }
    >
      {displayMode === "visual" ? (
        <div className="flex gap-3">
          <TimeGutter />
          <div className="min-w-0 flex-1">
            <DayColumnBody
              date={anchorDate}
              sessions={sessions}
              displayMode={displayMode}
              onEmptySlot={onEmptySlot}
              onSelectSession={onSelectSession}
              onDragSessionStart={onDragSessionStart}
              onDeleteSession={onDeleteSession}
              onDropSession={onDropSession}
            />
          </div>
        </div>
      ) : (
        <DayColumnBody
          date={anchorDate}
          sessions={sessions}
          displayMode={displayMode}
          onEmptySlot={onEmptySlot}
          onSelectSession={onSelectSession}
          onDragSessionStart={onDragSessionStart}
          onDeleteSession={onDeleteSession}
          onDropSession={onDropSession}
        />
      )}
    </ScheduleScrollShell>
  )
}
