"use client"

import {
  CheckIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
} from "lucide-react"

import { resultArtistLine } from "@/app/bibliotheque/_components/album-search-hit-label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { CatalogSearchHit } from "@/lib/catalog/discogs/types"

export type AlbumSearchResultRowProps = {
  hit: CatalogSearchHit
  queued: boolean
  loading: boolean
  disabled: boolean
  onToggleQueue: () => void
  onEdit: () => void
}

export function AlbumSearchResultRow({
  hit,
  queued,
  loading,
  disabled,
  onToggleQueue,
  onEdit,
}: AlbumSearchResultRowProps) {
  const canQueue = Boolean(hit.spotifyAlbumId)

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border p-2 transition-colors",
        queued ? "border-primary/40 bg-primary/5" : "border-border bg-card"
      )}
    >
      <Button
        type="button"
        variant={queued ? "default" : "outline"}
        size="icon-sm"
        disabled={disabled || !canQueue || loading}
        onClick={onToggleQueue}
        aria-label={queued ? "Retirer de la file" : "Ajouter à la file"}
      >
        {loading ? (
          <Loader2Icon className="animate-spin" />
        ) : queued ? (
          <CheckIcon />
        ) : (
          <PlusIcon />
        )}
      </Button>

      {hit.thumbUrl ? (
        <img
          src={hit.thumbUrl}
          alt=""
          className="size-12 shrink-0 rounded object-cover"
        />
      ) : (
        <div className="size-12 shrink-0 rounded bg-muted" />
      )}

      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="truncate font-medium">{hit.title}</p>
        <p className="truncate text-sm text-muted-foreground">
          {resultArtistLine(hit)}
        </p>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={disabled || !canQueue || loading}
        onClick={onEdit}
      >
        <PencilIcon />
        Éditer
      </Button>
    </div>
  )
}
