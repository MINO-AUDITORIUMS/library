import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { Suspense } from "react"

import { LibraryPageClient } from "@/app/bibliotheque/_components/library-page-client"
import { getRequestCachedTotalAlbumCount } from "@/lib/catalog/db/library-cache"
import { getLibraryPageData } from "@/lib/catalog/db/library-list"
import {
  parseLibraryStateFromSearchParams,
  serializeLibraryStateToSearchParams,
} from "@/lib/catalog/library-pagination"
import { routes } from "@/lib/routes"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Bibliothèque",
}

function toURLSearchParams(
  params: Record<string, string | string[] | undefined>
) {
  const urlParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") {
      urlParams.set(key, value)
    } else if (Array.isArray(value)) {
      for (const item of value) {
        urlParams.append(key, item)
      }
    }
  }

  return urlParams
}

export default async function BibliothequePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = await searchParams
  const urlParams = toURLSearchParams(resolvedSearchParams)
  const initialState = parseLibraryStateFromSearchParams(urlParams)

  const supabase = await createClient()
  const [pageData, totalAlbumCount] = await Promise.all([
    getLibraryPageData(
      supabase,
      initialState.filters,
      initialState.pagination,
      { cacheFilterOptions: true }
    ),
    getRequestCachedTotalAlbumCount(supabase),
  ])

  const shouldRedirect =
    pageData.filters.subgenre !== initialState.filters.subgenre ||
    pageData.pagination.page !== initialState.pagination.page

  if (shouldRedirect) {
    const query = serializeLibraryStateToSearchParams(
      pageData.filters,
      pageData.pagination
    )
    redirect(query ? `${routes.bibliotheque}?${query}` : routes.bibliotheque)
  }

  return (
    <Suspense>
      <LibraryPageClient
        albums={pageData.albums}
        totalAlbumCount={totalAlbumCount}
        totalFilteredCount={pageData.totalFilteredCount}
        filters={pageData.filters}
        pagination={pageData.pagination}
        filterOptions={pageData.filterOptions}
      />
    </Suspense>
  )
}
