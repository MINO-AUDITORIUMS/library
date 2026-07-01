"use client"

import { PlusIcon } from "lucide-react"

import { CurrentTimeIndicator } from "@/app/programmation/_components/current-time-indicator"
import { SessionBlock } from "@/app/programmation/_components/session-block"
import { SessionTextRow } from "@/app/programmation/_components/session-text-row"
import { DayGridLines } from "@/app/programmation/_components/day-grid-lines"
import { Button } from "@/components/ui/button"
import {
  GRID_HEIGHT_PX,
  GRID_START_MINUTES,
  PIXELS_PER_MINUTE,
} from "@/lib/programmation/constants"
import { toDateKey } from "@/lib/programmation/dates"
import { formatMinutesAsTime } from "@/lib/programmation/duration"
import { sessionsForDay } from "@/lib/programmation/session-stats"
import type {
  PlanningDisplayMode,
  ProgrammationSession,
} from "@/lib/programmation/types"

export type DayColumnBodyProps = {
  date: Date
  sessions: ProgrammationSession[]
  displayMode: PlanningDisplayMode
  onEmptySlot: (dateKey: string, startTime: string) => void
  onSelectSession: (sessionId: string) => void
  onDragSessionStart: (
    sessionId: string,
    grabOffsetY: number,
    pointerId: number
  ) => void
  dragging: boolean
  dragIndicatorTop: number | null
  onDeleteSession: (sessionId: string) => void
}

export function DayColumnBody({
  date,
  sessions,
  displayMode,
  onEmptySlot,
  onSelectSession,
  onDragSessionStart,
  dragging,
  dragIndicatorTop,
  onDeleteSession,
}: DayColumnBodyProps) {
  const dateKey = toDateKey(date)
  const daySessions = sessionsForDay(sessions, dateKey)

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (dragging) return
    if (displayMode !== "visual") return
    if (event.button !== 0) return
    const rect = event.currentTarget.getBoundingClientRect()
    const offsetY = event.clientY - rect.top
    const minutes = 9 * 60 + Math.round(offsetY / 2)
    const hours = Math.floor(minutes / 60)
    const mins = Math.round((minutes % 60) / 15) * 15
    onEmptySlot(
      dateKey,
      `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`
    )
  }

  if (displayMode === "visual") {
    return (
      <div
        className="relative rounded-xl border bg-muted/10"
        style={{ height: GRID_HEIGHT_PX }}
        onPointerDown={handlePointerDown}
        data-datekey={dateKey}
      >
        <DayGridLines />
        <CurrentTimeIndicator date={date} />
        {dragIndicatorTop != null ? (
          <div
            className="pointer-events-none absolute right-0 left-0 z-30"
            style={{ top: dragIndicatorTop }}
            aria-hidden="true"
          >
            <div className="h-0.5 bg-primary shadow-[0_0_0_1px_hsl(var(--background))]" />
            <div className="absolute -top-3 left-2 rounded-md bg-background px-1.5 py-0.5 text-[10px] font-medium text-foreground shadow-sm ring-1 ring-border/70">
              {formatMinutesAsTime(
                GRID_START_MINUTES +
                  Math.round(dragIndicatorTop / PIXELS_PER_MINUTE)
              )}
            </div>
          </div>
        ) : null}
        {daySessions.map((session) => (
          <SessionBlock
            key={session.id}
            session={session}
            onSelect={onSelectSession}
            onDragStart={onDragSessionStart}
            onDelete={onDeleteSession}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {daySessions.map((session) => (
        <SessionTextRow
          key={session.id}
          session={session}
          onSelect={onSelectSession}
          onDragStart={onDragSessionStart}
          onDelete={onDeleteSession}
        />
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => onEmptySlot(dateKey, "14:00")}
      >
        <PlusIcon />
        Ajouter
      </Button>
    </div>
  )
}
