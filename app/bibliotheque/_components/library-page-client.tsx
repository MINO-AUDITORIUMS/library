"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

import { AlbumCard } from "@/components/catalog/album-card"
import { AlbumListRow } from "@/components/catalog/album-list-row"
import {
  LibraryToolbar,
  type LibraryViewMode,
} from "@/components/catalog/library-toolbar"
import { routes } from "@/lib/routes"
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

export type LibraryPageClientProps = {
  initialAlbums: AlbumSummary[]
}

export function LibraryPageClient({ initialAlbums }: LibraryPageClientProps) {
  const albums = initialAlbums
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

      {albums.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
          Aucun album dans la bibliothèque.{" "}
          <Link
            href={routes.bibliothequeNew}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Ajouter un premier album
          </Link>
        </p>
      ) : filtered.length === 0 ? (
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
