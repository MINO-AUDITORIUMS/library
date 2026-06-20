"use client"

import {
  ChevronDownIcon,
  ChevronUpIcon,
  GripVerticalIcon,
  Trash2Icon,
} from "lucide-react"

import type {
  EditorTrack,
  EditorTrackField,
} from "@/app/bibliotheque/_components/use-tracklist-editor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export type AlbumTracklistEditRowProps = {
  track: EditorTrack
  position: number
  isFirst: boolean
  isLast: boolean
  disabled: boolean
  onPatch: (key: string, field: EditorTrackField, value: string) => void
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
  onMove,
  onRemove,
}: AlbumTracklistEditRowProps) {
  return (
    <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
      <div className="flex items-center gap-2">
        <GripVerticalIcon className="size-4 shrink-0 text-muted-foreground" />
        <span className="w-5 shrink-0 text-sm text-muted-foreground tabular-nums">
          {position}
        </span>
        <Input
          value={track.title}
          onChange={(event) => onPatch(track.key, "title", event.target.value)}
          placeholder="Titre de la piste"
          disabled={disabled}
          className="flex-1"
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

      <div className="mt-2 grid gap-2 pl-11 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Écriture</Label>
          <Input
            value={track.writers}
            onChange={(event) =>
              onPatch(track.key, "writers", event.target.value)
            }
            placeholder="Séparés par des virgules"
            disabled={disabled}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Production</Label>
          <Input
            value={track.producers}
            onChange={(event) =>
              onPatch(track.key, "producers", event.target.value)
            }
            placeholder="Séparés par des virgules"
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  )
}
