"use client"

import { Loader2Icon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { FeatArtistSearchHit } from "@/lib/catalog/feat-artist-search-hit"
import { cn } from "@/lib/utils"

export type FeaturingArtistSuggestionsProps = {
  suggestions: FeatArtistSearchHit[]
  loading: boolean
  query: string
  disabled: boolean
  onSelect: (hit: FeatArtistSearchHit) => void
}

function sourceLabel(source: FeatArtistSearchHit["source"]) {
  return source === "library" ? "Bibliothèque" : "Spotify"
}

export function FeaturingArtistSuggestions({
  suggestions,
  loading,
  query,
  disabled,
  onSelect,
}: FeaturingArtistSuggestionsProps) {
  if (query.trim().length < 2) return null

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-popover p-1 shadow-sm",
        "max-h-48 overflow-y-auto"
      )}
    >
      {loading ? (
        <p className="flex items-center gap-2 px-2 py-2 text-xs text-muted-foreground">
          <Loader2Icon className="size-3 animate-spin" />
          Recherche en cours…
        </p>
      ) : suggestions.length === 0 ? (
        <p className="px-2 py-2 text-sm text-muted-foreground">
          Aucun artiste trouvé. Entrée pour ajouter « {query.trim()} » tel quel.
        </p>
      ) : (
        suggestions.map((hit) => (
          <Button
            key={hit.key}
            type="button"
            variant="ghost"
            className="h-auto w-full justify-start gap-2 px-2 py-2 text-left text-sm font-normal"
            disabled={disabled}
            onClick={() => onSelect(hit)}
          >
            {hit.imageUrl ? (
              <img
                src={hit.imageUrl}
                alt=""
                className="size-8 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="size-8 shrink-0 rounded-full bg-muted" />
            )}
            <span className="min-w-0 flex-1 truncate">{hit.name}</span>
            <Badge variant="outline" className="shrink-0 text-[10px]">
              {sourceLabel(hit.source)}
            </Badge>
          </Button>
        ))
      )}
    </div>
  )
}
