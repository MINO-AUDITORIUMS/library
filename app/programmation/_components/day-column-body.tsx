"use client"

import { PlusIcon } from "lucide-react"

import { SessionBlock } from "@/app/programmation/_components/session-block"
import { SessionTextRow } from "@/app/programmation/_components/session-text-row"
import { DayGridLines } from "@/app/programmation/_components/day-grid-lines"
import { Button } from "@/components/ui/button"
import { GRID_HEIGHT_PX } from "@/lib/programmation/constants"
import { toDateKey } from "@/lib/programmation/dates"
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
  onDragSessionStart: (sessionId: string) => void
  onDeleteSession: (sessionId: string) => void
  onDropSession: (dateKey: string, offsetY: number) => void
}

export function DayColumnBody({
  date,
  sessions,
  displayMode,
  onEmptySlot,
  onSelectSession,
  onDragSessionStart,
  onDeleteSession,
  onDropSession,
}: DayColumnBodyProps) {
  const dateKey = toDateKey(date)
  const daySessions = sessionsForDay(sessions, dateKey)

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    const rect = event.currentTarget.getBoundingClientRect()
    onDropSession(dateKey, event.clientY - rect.top)
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
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
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        onPointerDown={handlePointerDown}
      >
        <DayGridLines />
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
