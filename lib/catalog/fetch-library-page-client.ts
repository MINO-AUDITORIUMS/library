import type { LibraryPagination } from "@/lib/catalog/library-pagination"
import type { AlbumSummary } from "@/lib/catalog/types"

export type LibraryPageApiResponse = {
  albums: AlbumSummary[]
  totalFilteredCount: number
  pagination: LibraryPagination
}

export async function fetchLibraryPageClient(
  query: string
): Promise<LibraryPageApiResponse> {
  const response = await fetch(
    query ? `/api/bibliotheque/page?${query}` : "/api/bibliotheque/page",
    {
      headers: {
        Accept: "application/json",
      },
    }
  )

  if (!response.ok) {
    throw new Error("Impossible de charger la bibliothèque.")
  }

  return response.json() as Promise<LibraryPageApiResponse>
}
