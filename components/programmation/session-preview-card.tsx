import Link from "next/link"

import { AlbumCover } from "@/components/catalog/album-cover"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { SESSION_STATUS_LABELS } from "@/lib/programmation/constants"
import { formatUpcomingSessionDate } from "@/lib/programmation/dates"
import type { ProgrammationSession } from "@/lib/programmation/types"
import { routes } from "@/lib/routes"
import { cn } from "@/lib/utils"

export type SessionPreviewCardProps = {
  session: ProgrammationSession
  className?: string
}

export function SessionPreviewCard({ session, className }: SessionPreviewCardProps) {
  const dateLabel = formatUpcomingSessionDate(session.date)

  return (
    <Link
      href={routes.programmation}
      className={cn("group block h-full", className)}
    >
      <Card className="flex h-full flex-col gap-0 overflow-hidden py-0 transition-colors hover:bg-muted/30">
        <AlbumCover
          title={session.album.title}
          hue={session.album.coverHue}
          imageUrl={session.album.coverImageUrl}
          size="md"
        />
        <CardContent className="flex min-h-[148px] flex-1 flex-col gap-2 px-3 py-3">
          <div className="space-y-0.5">
            <p className="line-clamp-2 min-h-10 font-medium leading-snug group-hover:text-primary">
              {session.album.title}
            </p>
            <p className="line-clamp-1 text-sm text-muted-foreground">
              {session.album.artist}
            </p>
          </div>
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{dateLabel}</span>
            <span className="tabular-nums">{session.startTime}</span>
          </div>
          <div className="mt-auto flex min-h-6 flex-wrap items-center gap-1">
            <Badge variant="muted" className="text-[10px]">
              {SESSION_STATUS_LABELS[session.status]}
            </Badge>
            <span className="text-[10px] text-muted-foreground">
              {session.durationMinutes} min
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
