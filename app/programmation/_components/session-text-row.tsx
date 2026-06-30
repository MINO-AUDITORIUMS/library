"use client"

import { Badge } from "@/components/ui/badge"
import { SESSION_STATUS_LABELS } from "@/lib/programmation/constants"
import type { ProgrammationSession } from "@/lib/programmation/types"
import { cn } from "@/lib/utils"

export type SessionTextRowProps = {
  session: ProgrammationSession
  onSelect: (sessionId: string) => void
  onDragStart: (sessionId: string) => void
}

export function SessionTextRow({
  session,
  onSelect,
  onDragStart,
}: SessionTextRowProps) {
  return (
    <button
      type="button"
      draggable
      onDragStart={() => onDragStart(session.id)}
      onClick={() => onSelect(session.id)}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border bg-card px-3 py-2 text-left transition hover:bg-muted/40",
        session.status === "annulee" && "opacity-50"
      )}
    >
      <span className="w-12 shrink-0 text-sm font-medium tabular-nums">
        {session.startTime}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{session.album.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {session.album.artist} · {session.durationMinutes} min
        </p>
      </div>
      <Badge variant="muted" className="shrink-0 text-[10px]">
        {SESSION_STATUS_LABELS[session.status]}
      </Badge>
    </button>
  )
}
