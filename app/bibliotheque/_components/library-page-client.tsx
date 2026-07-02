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
import { fetchLibraryPageClient } from "@/lib/catalog/fetch-library-page-client"
import {
  hasActiveLibraryFilters,
  LIBRARY_FILTER_ALL,
  type LibraryFilterOptions,
  type LibraryFilters,
} from "@/lib/catalog/library-filters"
import {
  DEFAULT_LIBRARY_PAGE_SIZE,
  hasExplicitPageSizeInSearchParams,
  parseLibraryStateFromSearchParams,
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
  const [displayAlbums, setDisplayAlbums] = useState(albums)
  const [displayFilteredCount, setDisplayFilteredCount] =
    useState(totalFilteredCount)
  const [displayPagination, setDisplayPagination] = useState(pagination)
  const [isPaginating, setIsPaginating] = useState(false)
  const queryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pageSizePreferenceAppliedRef = useRef(false)
  const paginationRequestRef = useRef(0)

  useEffect(() => {
    setQueryDraft(filters.query)
    setDisplayAlbums(albums)
    setDisplayFilteredCount(totalFilteredCount)
    setDisplayPagination(pagination)
  }, [albums, filters.query, pagination, totalFilteredCount])

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

  const navigateWithServer = useCallback(
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

  const navigatePagination = useCallback(
    async (nextPagination: LibraryPagination) => {
      const query = serializeLibraryStateToSearchParams(filters, nextPagination)
      const nextUrl = query ? `${pathname}?${query}` : pathname

      window.history.replaceState(null, "", nextUrl)

      const requestId = paginationRequestRef.current + 1
      paginationRequestRef.current = requestId
      setIsPaginating(true)

      try {
        const pageData = await fetchLibraryPageClient(query)
        if (paginationRequestRef.current !== requestId) return

        setDisplayAlbums(pageData.albums)
        setDisplayFilteredCount(pageData.totalFilteredCount)
        setDisplayPagination(pageData.pagination)
      } catch {
        router.replace(nextUrl, { scroll: false })
      } finally {
        if (paginationRequestRef.current === requestId) {
          setIsPaginating(false)
        }
      }
    },
    [filters, pathname, router]
  )

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search)
      const state = parseLibraryStateFromSearchParams(params)
      const filtersChanged =
        state.filters.query !== filters.query ||
        state.filters.genre !== filters.genre ||
        state.filters.subgenre !== filters.subgenre ||
        state.filters.tag !== filters.tag ||
        state.filters.country !== filters.country ||
        state.filters.yearFrom !== filters.yearFrom ||
        state.filters.yearTo !== filters.yearTo ||
        state.filters.minMinoRating !== filters.minMinoRating

      if (filtersChanged) {
        router.replace(
          params.toString() ? `${pathname}?${params}` : pathname,
          { scroll: false }
        )
        return
      }

      void navigatePagination(state.pagination)
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [filters, navigatePagination, pathname, router])

  const handleFiltersChange = useCallback(
    (patch: Partial<LibraryFilters>) => {
      navigateWithServer({ ...filters, ...patch }, { ...pagination, page: 1 })
    },
    [filters, navigateWithServer, pagination]
  )

  const handleQueryChange = useCallback(
    (query: string) => {
      setQueryDraft(query)

      if (queryTimerRef.current) {
        clearTimeout(queryTimerRef.current)
      }

      queryTimerRef.current = setTimeout(() => {
        navigateWithServer({ ...filters, query }, { ...pagination, page: 1 })
      }, 300)
    },
    [filters, navigateWithServer, pagination]
  )

  const handleResetFilters = useCallback(() => {
    navigateWithServer(
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
  }, [navigateWithServer, pagination])

  const handlePageChange = useCallback(
    (page: number) => {
      void navigatePagination({ ...displayPagination, page })
    },
    [displayPagination, navigatePagination]
  )

  const handlePageSizeChange = useCallback(
    (pageSize: LibraryPageSize) => {
      writeLibraryPageSizePreference(pageSize)
      void navigatePagination({ page: 1, pageSize })
    },
    [navigatePagination]
  )

  const emptyBecauseFilters =
    totalAlbumCount > 0 && displayFilteredCount === 0
  const isLoading = isPending || isPaginating

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-6 transition-opacity",
        isLoading && "opacity-60"
      )}
    >
      <LibraryToolbar
        query={queryDraft}
        onQueryChange={handleQueryChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={totalAlbumCount}
        filteredCount={displayFilteredCount}
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
          {displayAlbums.map((album) => (
            <AlbumCard key={album.id} album={album} variant="compact" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {displayAlbums.map((album) => (
            <AlbumListRow key={album.id} album={album} />
          ))}
        </div>
      )}

      {totalAlbumCount > 0 && displayFilteredCount > 0 ? (
        <LibraryPaginationBar
          page={displayPagination.page}
          pageSize={displayPagination.pageSize}
          totalItems={displayFilteredCount}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      ) : null}
    </div>
  )
}
