"use client"

import { useState } from "react"
import { ClapperboardIcon, PlayIcon } from "lucide-react"

import { TrackAddClipDialog } from "@/components/catalog/track-add-clip-dialog"
import { TrackCreditsPopover } from "@/components/catalog/track-credits-popover"
import { TrackVideoDialog } from "@/components/catalog/track-video-dialog"
import { Button } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { formatTrackDuration } from "@/lib/catalog/format"
import type { AlbumTrack } from "@/lib/catalog/types"
import { cn } from "@/lib/utils"

export type AlbumTracklistRowProps = {
  albumId: string
  track: AlbumTrack
}

export function AlbumTracklistRow({ albumId, track }: AlbumTracklistRowProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [addClipOpen, setAddClipOpen] = useState(false)
  const [videoOpen, setVideoOpen] = useState(false)
  const hasCredits = track.writers.length > 0 || track.producers.length > 0

  return (
    <>
      <ContextMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <ContextMenuTrigger asChild>
          <div
            className={cn(
              "flex cursor-default items-start justify-between gap-4 px-4 py-3 text-sm transition-colors",
              "hover:bg-muted/25"
            )}
          >
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <span className="w-6 shrink-0 pt-0.5 text-muted-foreground tabular-nums">
                {track.position}
              </span>
              <div className="min-w-0 space-y-0.5">
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate">{track.title}</p>
                  {hasCredits ? (
                    <TrackCreditsPopover
                      trackTitle={track.title}
                      writers={track.writers}
                      producers={track.producers}
                    />
                  ) : null}
                  {track.youtubeVideoId ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="size-6 shrink-0 text-primary"
                      aria-label="Voir le clip"
                      onClick={() => setVideoOpen(true)}
                    >
                      <PlayIcon className="size-3.5" />
                    </Button>
                  ) : null}
                </div>
                {track.featuring.length > 0 ? (
                  <p className="truncate text-xs font-normal text-muted-foreground">
                    Feat. {track.featuring.join(", ")}
                  </p>
                ) : null}
              </div>
            </div>
            <span className="shrink-0 pt-0.5 text-muted-foreground tabular-nums">
              {formatTrackDuration(track.durationSeconds)}
            </span>
          </div>
        </ContextMenuTrigger>

        <ContextMenuContent className="w-52">
          {track.youtubeVideoId ? (
            <ContextMenuItem
              onSelect={() => {
                setMenuOpen(false)
                setVideoOpen(true)
              }}
            >
              <PlayIcon className="size-4 opacity-80" />
              Voir le clip
            </ContextMenuItem>
          ) : (
            <ContextMenuItem
              onSelect={() => {
                setMenuOpen(false)
                setAddClipOpen(true)
              }}
            >
              <ClapperboardIcon className="size-4 opacity-80" />
              Ajouter un clip
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>

      {track.youtubeVideoId ? (
        <TrackVideoDialog
          videoId={track.youtubeVideoId}
          trackTitle={track.title}
          open={videoOpen}
          onOpenChange={(open) => {
            setVideoOpen(open)
            if (!open) setMenuOpen(false)
          }}
        />
      ) : (
        <TrackAddClipDialog
          albumId={albumId}
          position={track.position}
          trackTitle={track.title}
          open={addClipOpen}
          onOpenChange={(open) => {
            setAddClipOpen(open)
            if (!open) setMenuOpen(false)
          }}
        />
      )}
    </>
  )
}

