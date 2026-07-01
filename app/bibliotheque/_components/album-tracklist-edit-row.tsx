"use client"

import {
  ChevronDownIcon,
  ChevronUpIcon,
  GripVerticalIcon,
  Trash2Icon,
} from "lucide-react"

import { AlbumTracklistEditCredits } from "@/app/bibliotheque/_components/album-tracklist-edit-credits"
import type {
  EditorCreditField,
  EditorTrack,
  EditorTrackField,
} from "@/app/bibliotheque/_components/use-tracklist-editor"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export type AlbumTracklistEditRowProps = {
  track: EditorTrack
  position: number
  isFirst: boolean
  isLast: boolean
  disabled: boolean
  onPatch: (key: string, field: EditorTrackField, value: string) => void
  onPatchCredits: (
    key: string,
    field: EditorCreditField,
    value: string[]
  ) => void
  onMove: (key: string, direction: -1 | 1) => void
  onRemove: (key: string) => void
}

export function AlbumTracklistEditRow({
  track,
  position,
  isFirst,
  isLast,
  disabled,
  onPatch,
  onPatchCredits,
  onMove,
  onRemove,
}: AlbumTracklistEditRowProps) {
  const creditCount =
    track.featuring.length + track.writers.length + track.producers.length

  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-border/70 bg-muted/20 p-3">
      <div className="flex items-start gap-2">
        <GripVerticalIcon className="mt-2.5 size-4 shrink-0 text-muted-foreground" />
        <span className="mt-2 w-5 shrink-0 text-sm text-muted-foreground tabular-nums">
          {position}
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={track.title}
              onChange={(event) =>
                onPatch(track.key, "title", event.target.value)
              }
              placeholder="Titre de la piste"
              disabled={disabled}
              className="min-w-[12rem] flex-1"
            />
            <Input
              value={track.duration}
              onChange={(event) =>
                onPatch(track.key, "duration", event.target.value)
              }
              placeholder="3:45"
              inputMode="numeric"
              disabled={disabled}
              className="w-20 shrink-0 text-center tabular-nums"
            />
            {creditCount > 0 ? (
              <Badge variant="outline" className="shrink-0 tabular-nums">
                {creditCount} crédit{creditCount > 1 ? "s" : ""}
              </Badge>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Monter la piste"
            disabled={disabled || isFirst}
            onClick={() => onMove(track.key, -1)}
          >
            <ChevronUpIcon />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Descendre la piste"
            disabled={disabled || isLast}
            onClick={() => onMove(track.key, 1)}
          >
            <ChevronDownIcon />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Supprimer la piste"
            className="text-destructive hover:text-destructive"
            disabled={disabled}
            onClick={() => onRemove(track.key)}
          >
            <Trash2Icon />
          </Button>
        </div>
      </div>

      <AlbumTracklistEditCredits
        featuring={track.featuring}
        writers={track.writers}
        producers={track.producers}
        disabled={disabled}
        onCreditsChange={(field, value) =>
          onPatchCredits(track.key, field, value)
        }
      />
    </div>
  )
}
