"use client"

import { AlbumCover } from "@/components/catalog/album-cover"
import { Badge } from "@/components/ui/badge"
import {
  GRID_START_MINUTES,
  PIXELS_PER_MINUTE,
  SESSION_STATUS_LABELS,
} from "@/lib/programmation/constants"
import { parseTimeToMinutes } from "@/lib/programmation/duration"
import type { ProgrammationSession } from "@/lib/programmation/types"
import { cn } from "@/lib/utils"

export type SessionBlockProps = {
  session: ProgrammationSession
  onSelect: (sessionId: string) => void
  onDragStart: (sessionId: string) => void
  className?: string
}

const statusVariant = {
  brouillon: "muted",
  confirmee: "default",
  passee: "secondary",
  annulee: "outline",
} as const

export function SessionBlock({
  session,
  onSelect,
  onDragStart,
  className,
}: SessionBlockProps) {
  const top =
    (parseTimeToMinutes(session.startTime) - GRID_START_MINUTES) *
    PIXELS_PER_MINUTE
  const height = Math.max(session.durationMinutes * PIXELS_PER_MINUTE, 48)

  return (
    <button
      type="button"
      draggable
      onDragStart={(event) => {
        event.stopPropagation()
        onDragStart(session.id)
      }}
      onClick={(event) => {
        event.stopPropagation()
        onSelect(session.id)
      }}
      className={cn(
        "absolute right-1 left-1 overflow-hidden rounded-lg border text-left shadow-sm transition hover:ring-2 hover:ring-primary/30",
        session.status === "annulee" && "opacity-50",
        className
      )}
      style={{
        top,
        height,
        backgroundImage: `linear-gradient(135deg, hsl(${session.album.coverHue} 40% 24% / 0.95), hsl(${session.album.coverHue} 50% 14% / 0.98))`,
      }}
    >
      <div className="flex h-full gap-2 p-2">
        <AlbumCover
          title={session.album.title}
          hue={session.album.coverHue}
          imageUrl={session.album.coverImageUrl}
          size="sm"
          className="size-10 shrink-0 rounded-md"
        />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-xs font-semibold text-white">
            {session.album.title}
          </p>
          <p className="truncate text-[11px] text-white/80">
            {session.album.artist}
          </p>
          <p className="mt-1 text-[11px] text-white/70">
            {session.startTime} · {session.durationMinutes} min
          </p>
        </div>
      </div>
      <Badge
        variant={statusVariant[session.status]}
        className="absolute top-1.5 right-1.5 text-[10px]"
      >
        {SESSION_STATUS_LABELS[session.status]}
      </Badge>
    </button>
  )
}
