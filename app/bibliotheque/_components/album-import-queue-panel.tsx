"use client"

import {
  AlertCircleIcon,
  CheckCircle2Icon,
  ExternalLinkIcon,
  Loader2Icon,
  Trash2Icon,
  XIcon,
} from "lucide-react"

import { resultArtistLine } from "@/app/bibliotheque/_components/album-search-hit-label"
import type { AlbumQueueItem } from "@/app/bibliotheque/_components/use-album-import-queue"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export type AlbumImportQueuePanelProps = {
  queue: AlbumQueueItem[]
  importing: boolean
  onRemove: (key: string) => void
  onClear: () => void
  onClearFinished: () => void
  onImportAll: () => void
  onOpenAlbum: (albumId: string) => void
}

function QueueStatusIcon({ item }: { item: AlbumQueueItem }) {
  if (item.status === "importing") {
    return <Loader2Icon className="size-4 shrink-0 animate-spin text-muted-foreground" />
  }
  if (item.status === "success") {
    return <CheckCircle2Icon className="size-4 shrink-0 text-emerald-600" />
  }
  if (item.status === "duplicate") {
    return <AlertCircleIcon className="size-4 shrink-0 text-amber-600" />
  }
  if (item.status === "error") {
    return <AlertCircleIcon className="size-4 shrink-0 text-destructive" />
  }
  return null
}

export function AlbumImportQueuePanel({
  queue,
  importing,
  onRemove,
  onClear,
  onClearFinished,
  onImportAll,
  onOpenAlbum,
}: AlbumImportQueuePanelProps) {
  if (queue.length === 0) return null

  const pendingCount = queue.filter((item) => item.status === "pending").length
  const finishedCount = queue.length - pendingCount

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">File d&apos;import</CardTitle>
          <Badge variant="secondary">{queue.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
          {queue.map((item) => (
            <li
              key={item.hit.key}
              className={cn(
                "flex items-center gap-2 rounded-md border px-2 py-1.5",
                item.status === "success" && "border-emerald-500/30 bg-emerald-500/5",
                item.status === "duplicate" && "border-amber-500/30 bg-amber-500/5",
                item.status === "error" && "border-destructive/30 bg-destructive/5"
              )}
            >
              <QueueStatusIcon item={item} />

              {item.hit.thumbUrl ? (
                <img
                  src={item.hit.thumbUrl}
                  alt=""
                  className="size-9 shrink-0 rounded object-cover"
                />
              ) : (
                <div className="size-9 shrink-0 rounded bg-muted" />
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.hit.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {item.message ?? resultArtistLine(item.hit)}
                </p>
              </div>

              {item.albumId ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onOpenAlbum(item.albumId!)}
                  aria-label="Voir la fiche"
                >
                  <ExternalLinkIcon />
                </Button>
              ) : null}

              {item.status === "pending" ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={importing}
                  onClick={() => onRemove(item.hit.key)}
                  aria-label="Retirer"
                >
                  <XIcon />
                </Button>
              ) : null}
            </li>
          ))}
        </ul>

        <Separator />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={importing}
              onClick={onClear}
            >
              <Trash2Icon />
              Tout vider
            </Button>
            {finishedCount > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={importing}
                onClick={onClearFinished}
              >
                Retirer les terminés
              </Button>
            ) : null}
          </div>

          <Button
            type="button"
            disabled={importing || pendingCount === 0}
            onClick={onImportAll}
          >
            {importing ? <Loader2Icon className="animate-spin" /> : null}
            Importer {pendingCount > 0 ? `${pendingCount} album${pendingCount > 1 ? "s" : ""}` : "la sélection"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
