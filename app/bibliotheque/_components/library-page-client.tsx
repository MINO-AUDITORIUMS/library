"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo, useState } from "react"

import { AlbumCard } from "@/components/catalog/album-card"
import { AlbumListRow } from "@/components/catalog/album-list-row"
import { LibraryFiltersPanel } from "@/components/catalog/library-filters-panel"
import {
  LibraryToolbar,
  type LibraryViewMode,
} from "@/components/catalog/library-toolbar"
import { Button } from "@/components/ui/button"
import { filterAlbums } from "@/lib/catalog/filter-albums"
import {
  defaultLibraryFilters,
  deriveLibraryFilterOptions,
  hasActiveLibraryFilters,
  LIBRARY_FILTER_ALL,
  parseLibraryFiltersFromSearchParams,
  serializeLibraryFiltersToSearchParams,
  type LibraryFilters,
} from "@/lib/catalog/library-filters"
import type { AlbumSummary } from "@/lib/catalog/types"
import { routes } from "@/lib/routes"

export type LibraryPageClientProps = {
  initialAlbums: AlbumSummary[]
}

function withValidSubgenre(
  albums: AlbumSummary[],
  filters: LibraryFilters
): LibraryFilters {
  if (filters.subgenre === LIBRARY_FILTER_ALL) return filters

  const options = deriveLibraryFilterOptions(albums, filters.genre)
  if (options.subgenres.includes(filters.subgenre)) return filters

  return { ...filters, subgenre: LIBRARY_FILTER_ALL }
}

export function LibraryPageClient({ initialAlbums }: LibraryPageClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [filters, setFilters] = useState<LibraryFilters>(() =>
    withValidSubgenre(
      initialAlbums,
      parseLibraryFiltersFromSearchParams(searchParams)
    )
  )
  const [viewMode, setViewMode] = useState<LibraryViewMode>("grid")

  const filterOptions = useMemo(
    () => deriveLibraryFilterOptions(initialAlbums, filters.genre),
    [initialAlbums, filters.genre]
  )

  const filtered = useMemo(
    () => filterAlbums(initialAlbums, filters),
    [initialAlbums, filters]
  )

  const syncFilters = useCallback(
    (next: LibraryFilters) => {
      const normalized = withValidSubgenre(initialAlbums, next)
      setFilters(normalized)
      const query = serializeLibraryFiltersToSearchParams(normalized)
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    },
    [initialAlbums, pathname, router]
  )

  const handleFiltersChange = useCallback(
    (patch: Partial<LibraryFilters>) => {
      syncFilters({ ...filters, ...patch })
    },
    [filters, syncFilters]
  )

  const handleQueryChange = useCallback(
    (query: string) => {
      handleFiltersChange({ query })
    },
    [handleFiltersChange]
  )

  const handleResetFilters = useCallback(() => {
    syncFilters(defaultLibraryFilters)
  }, [syncFilters])

  const emptyBecauseFilters = initialAlbums.length > 0 && filtered.length === 0

  return (
    <div className="flex w-full flex-col gap-6">
      <LibraryToolbar
        query={filters.query}
        onQueryChange={handleQueryChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={initialAlbums.length}
        filteredCount={filtered.length}
      />

      {initialAlbums.length > 0 ? (
        <LibraryFiltersPanel
          filters={filters}
          options={filterOptions}
          onFiltersChange={handleFiltersChange}
          onReset={handleResetFilters}
        />
      ) : null}

      {initialAlbums.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
          Aucun album dans la bibliothèque.{" "}
          <Link
            href={routes.bibliothequeNew}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Ajouter un premier album
          </Link>
        </p>
      ) : emptyBecauseFilters ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
          {hasActiveLibraryFilters(filters)
            ? "Aucun album ne correspond aux filtres sélectionnés."
            : "Aucun album ne correspond à ta recherche."}{" "}
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-sm"
            onClick={handleResetFilters}
          >
            Réinitialiser les filtres
          </Button>
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
