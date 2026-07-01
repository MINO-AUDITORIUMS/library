"use client"

import { PlusIcon } from "lucide-react"

import { ScheduleScrollShell } from "@/app/programmation/_components/schedule-scroll-shell"
import { SessionContextMenu } from "@/app/programmation/_components/session-context-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  formatWeekdayShort,
  isToday,
  monthCalendarDays,
  toDateKey,
} from "@/lib/programmation/dates"
import { sessionsForDay } from "@/lib/programmation/session-stats"
import type { ProgrammationSession } from "@/lib/programmation/types"
import { cn } from "@/lib/utils"

export type ProgrammationMonthViewProps = {
  anchorDate: Date
  sessions: ProgrammationSession[]
  onEmptySlot: (dateKey: string, startTime: string) => void
  onSelectSession: (sessionId: string) => void
  onDeleteSession: (sessionId: string) => void
}

const weekdayLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

export function ProgrammationMonthView({
  anchorDate,
  sessions,
  onEmptySlot,
  onSelectSession,
  onDeleteSession,
}: ProgrammationMonthViewProps) {
  const days = monthCalendarDays(anchorDate)
  const monthIndex = anchorDate.getMonth()

  return (
    <ScheduleScrollShell
      header={
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-muted-foreground">
          {weekdayLabels.map((label) => (
            <div key={label}>{label}</div>
          ))}
        </div>
      }
    >
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dateKey = toDateKey(day)
          const daySessions = sessionsForDay(sessions, dateKey)
          const inMonth = day.getMonth() === monthIndex

          return (
            <div
              key={dateKey}
              className={cn(
                "min-h-28 rounded-xl border p-2",
                inMonth ? "bg-background" : "bg-muted/20 opacity-60",
                isToday(day) && "ring-2 ring-primary/30"
              )}
            >
              <div className="mb-2 flex items-center justify-between gap-1">
                <span className="text-xs font-medium">
                  {day.getDate()} {formatWeekdayShort(day)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onEmptySlot(dateKey, "14:00")}
                >
                  <PlusIcon />
                </Button>
              </div>

              <div className="space-y-1">
                {daySessions.slice(0, 3).map((session) => (
                  <SessionContextMenu
                    key={session.id}
                    onOpenDetails={() => onSelectSession(session.id)}
                    onDelete={() => onDeleteSession(session.id)}
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => onSelectSession(session.id)}
                      className="h-auto w-full justify-start gap-1 rounded-md px-1.5 py-1 text-left text-[11px] hover:bg-muted/50"
                    >
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{
                          backgroundColor: `hsl(${session.album.coverHue} 55% 45%)`,
                        }}
                      />
                      <span className="truncate">
                        {session.startTime} {session.album.title}
                      </span>
                    </Button>
                  </SessionContextMenu>
                ))}
                {daySessions.length > 3 ? (
                  <Badge variant="muted" className="text-[10px]">
                    +{daySessions.length - 3}
                  </Badge>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </ScheduleScrollShell>
  )
}
