"use client"

import { useMemo, useState } from "react"
import { SearchIcon } from "lucide-react"

import { ArtistCard } from "@/components/catalog/artist-card"
import { Input } from "@/components/ui/input"
import type { ArtistSummary } from "@/lib/catalog/types"

export type ArtistsPageClientProps = {
  initialArtists: ArtistSummary[]
}

export function ArtistsPageClient({ initialArtists }: ArtistsPageClientProps) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return initialArtists

    return initialArtists.filter((artist) => {
      const haystack = [artist.name, artist.country].join(" ").toLowerCase()
      return haystack.includes(normalized)
    })
  }, [initialArtists, query])

  const emptyBecauseSearch =
    initialArtists.length > 0 && filtered.length === 0 && query.trim().length > 0

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Artistes</h1>
          <p className="text-sm text-muted-foreground">
            Fiches artistes liées aux albums de la bibliothèque MINO.
          </p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un artiste…"
            className="pl-8"
          />
        </div>
      </div>

      {initialArtists.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-12 text-center text-sm text-muted-foreground">
          Aucun artiste enregistré. Les fiches sont créées automatiquement lors
          de l&apos;import d&apos;albums depuis Discogs ou MusicBrainz.
        </p>
      ) : emptyBecauseSearch ? (
        <p className="rounded-xl border border-dashed px-4 py-12 text-center text-sm text-muted-foreground">
          Aucun artiste ne correspond à « {query.trim()} ».
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      )}
    </div>
  )
}
