"use client"

import { useMemo, useState } from "react"

import { AlbumCard } from "@/components/catalog/album-card"
import { AlbumListRow } from "@/components/catalog/album-list-row"
import {
  LibraryToolbar,
  type LibraryViewMode,
} from "@/components/catalog/library-toolbar"
import { getMockAlbumSummaries } from "@/lib/catalog/mock-albums"
import type { AlbumSummary } from "@/lib/catalog/types"

function matchesQuery(album: AlbumSummary, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    album.title.toLowerCase().includes(q) ||
    album.artist.toLowerCase().includes(q) ||
    album.label.toLowerCase().includes(q) ||
    album.genre.toLowerCase().includes(q) ||
    album.tags.some((t) => t.toLowerCase().includes(q))
  )
}

export function LibraryPageClient() {
  const albums = useMemo(() => getMockAlbumSummaries(), [])
  const [query, setQuery] = useState("")
  const [viewMode, setViewMode] = useState<LibraryViewMode>("grid")

  const filtered = useMemo(
    () => albums.filter((a) => matchesQuery(a, query)),
    [albums, query]
  )

  return (
    <div className="flex w-full flex-col gap-6">
      <LibraryToolbar
        query={query}
        onQueryChange={setQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={albums.length}
        filteredCount={filtered.length}
      />

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
          Aucun album ne correspond à ta recherche.
        </p>
      ) : viewMode === "grid" ? (
        <div className="grid auto-rows-fr grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {filtered.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((album) => (
            <AlbumListRow key={album.id} album={album} />
          ))}
        </div>
      )}
    </div>
  )
}
