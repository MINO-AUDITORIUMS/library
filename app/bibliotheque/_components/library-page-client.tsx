"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react"

import { AlbumCard } from "@/components/catalog/album-card"
import { AlbumListRow } from "@/components/catalog/album-list-row"
import { LibraryFiltersPanel } from "@/components/catalog/library-filters-panel"
import { LibraryPaginationBar } from "@/components/catalog/library-pagination-bar"
import {
  LibraryToolbar,
  type LibraryViewMode,
} from "@/components/catalog/library-toolbar"
import { Button } from "@/components/ui/button"
import {
  hasActiveLibraryFilters,
  LIBRARY_FILTER_ALL,
  type LibraryFilterOptions,
  type LibraryFilters,
} from "@/lib/catalog/library-filters"
import {
  DEFAULT_LIBRARY_PAGE_SIZE,
  hasExplicitPageSizeInSearchParams,
  serializeLibraryStateToSearchParams,
  type LibraryPageSize,
  type LibraryPagination,
} from "@/lib/catalog/library-pagination"
import {
  readLibraryPageSizePreference,
  writeLibraryPageSizePreference,
} from "@/lib/catalog/library-page-size-preference"
import type { AlbumSummary } from "@/lib/catalog/types"
import { routes } from "@/lib/routes"
import { cn } from "@/lib/utils"

export type LibraryPageClientProps = {
  albums: AlbumSummary[]
  totalAlbumCount: number
  totalFilteredCount: number
  filters: LibraryFilters
  pagination: LibraryPagination
  filterOptions: LibraryFilterOptions
}

export function LibraryPageClient({
  albums,
  totalAlbumCount,
  totalFilteredCount,
  filters,
  pagination,
  filterOptions,
}: LibraryPageClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [viewMode, setViewMode] = useState<LibraryViewMode>("grid")
  const [queryDraft, setQueryDraft] = useState(filters.query)
  const queryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pageSizePreferenceAppliedRef = useRef(false)

  useEffect(() => {
    setQueryDraft(filters.query)
  }, [filters.query])

  useEffect(() => {
    return () => {
      if (queryTimerRef.current) {
        clearTimeout(queryTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (pageSizePreferenceAppliedRef.current) return
    pageSizePreferenceAppliedRef.current = true

    const params = new URLSearchParams(searchParams.toString())
    if (hasExplicitPageSizeInSearchParams(params)) return

    const preferredPageSize = readLibraryPageSizePreference()
    if (
      !preferredPageSize ||
      preferredPageSize === DEFAULT_LIBRARY_PAGE_SIZE
    ) {
      return
    }

    const query = serializeLibraryStateToSearchParams(filters, {
      ...pagination,
      page: 1,
      pageSize: preferredPageSize,
    })

    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [filters, pagination, pathname, router, searchParams])

  const navigate = useCallback(
    (nextFilters: LibraryFilters, nextPagination: LibraryPagination) => {
      const query = serializeLibraryStateToSearchParams(
        nextFilters,
        nextPagination
      )

      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, {
          scroll: false,
        })
      })
    },
    [pathname, router]
  )

  const handleFiltersChange = useCallback(
    (patch: Partial<LibraryFilters>) => {
      navigate({ ...filters, ...patch }, { ...pagination, page: 1 })
    },
    [filters, navigate, pagination]
  )

  const handleQueryChange = useCallback(
    (query: string) => {
      setQueryDraft(query)

      if (queryTimerRef.current) {
        clearTimeout(queryTimerRef.current)
      }

      queryTimerRef.current = setTimeout(() => {
        navigate({ ...filters, query }, { ...pagination, page: 1 })
      }, 300)
    },
    [filters, navigate, pagination]
  )

  const handleResetFilters = useCallback(() => {
    navigate(
      {
        query: "",
        genre: LIBRARY_FILTER_ALL,
        subgenre: LIBRARY_FILTER_ALL,
        tag: LIBRARY_FILTER_ALL,
        country: LIBRARY_FILTER_ALL,
        yearFrom: LIBRARY_FILTER_ALL,
        yearTo: LIBRARY_FILTER_ALL,
        minMinoRating: LIBRARY_FILTER_ALL,
      },
      { ...pagination, page: 1 }
    )
  }, [navigate, pagination])

  const handlePageChange = useCallback(
    (page: number) => {
      navigate(filters, { ...pagination, page })
    },
    [filters, navigate, pagination]
  )

  const handlePageSizeChange = useCallback(
    (pageSize: LibraryPageSize) => {
      writeLibraryPageSizePreference(pageSize)
      navigate(filters, { page: 1, pageSize })
    },
    [filters, navigate]
  )

  const emptyBecauseFilters =
    totalAlbumCount > 0 && totalFilteredCount === 0

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-6 transition-opacity",
        isPending && "opacity-60"
      )}
    >
      <LibraryToolbar
        query={queryDraft}
        onQueryChange={handleQueryChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={totalAlbumCount}
        filteredCount={totalFilteredCount}
      />

      {totalAlbumCount > 0 ? (
        <LibraryFiltersPanel
          filters={filters}
          options={filterOptions}
          onFiltersChange={handleFiltersChange}
          onReset={handleResetFilters}
        />
      ) : null}

      {totalAlbumCount === 0 ? (
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
        <div className="grid auto-rows-fr grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} variant="compact" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {albums.map((album) => (
            <AlbumListRow key={album.id} album={album} />
          ))}
        </div>
      )}

      {totalAlbumCount > 0 && totalFilteredCount > 0 ? (
        <LibraryPaginationBar
          page={pagination.page}
          pageSize={pagination.pageSize}
          totalItems={totalFilteredCount}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      ) : null}
    </div>
  )
}
