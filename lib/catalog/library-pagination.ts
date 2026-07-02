import {
  parseLibraryFiltersFromSearchParams,
  serializeLibraryFiltersToSearchParams,
  type LibraryFilters,
} from "@/lib/catalog/library-filters"

export const LIBRARY_PAGE_SIZE_OPTIONS = [12, 24, 48] as const

export type LibraryPageSize = (typeof LIBRARY_PAGE_SIZE_OPTIONS)[number]

export const DEFAULT_LIBRARY_PAGE_SIZE: LibraryPageSize = 24

export type LibraryPagination = {
  page: number
  pageSize: LibraryPageSize
}

function parsePageSize(value: string | null): LibraryPageSize {
  const parsed = Number.parseInt(value ?? "", 10)
  if (LIBRARY_PAGE_SIZE_OPTIONS.includes(parsed as LibraryPageSize)) {
    return parsed as LibraryPageSize
  }
  return DEFAULT_LIBRARY_PAGE_SIZE
}

export function parseLibraryPaginationFromSearchParams(
  params: URLSearchParams
): LibraryPagination {
  const page = Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1)
  return {
    page,
    pageSize: parsePageSize(params.get("perPage")),
  }
}

export function clampLibraryPage(
  page: number,
  totalItems: number,
  pageSize: number
) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize) || 1)
  return Math.min(Math.max(1, page), totalPages)
}

export function paginateItems<T>(
  items: T[],
  page: number,
  pageSize: number
): T[] {
  const start = (page - 1) * pageSize
  return items.slice(start, start + pageSize)
}

export function parseLibraryStateFromSearchParams(params: URLSearchParams) {
  return {
    filters: parseLibraryFiltersFromSearchParams(params),
    pagination: parseLibraryPaginationFromSearchParams(params),
  }
}

export function serializeLibraryStateToSearchParams(
  filters: LibraryFilters,
  pagination: LibraryPagination
) {
  const params = new URLSearchParams(
    serializeLibraryFiltersToSearchParams(filters)
  )

  if (pagination.page > 1) {
    params.set("page", String(pagination.page))
  }

  if (pagination.pageSize !== DEFAULT_LIBRARY_PAGE_SIZE) {
    params.set("perPage", String(pagination.pageSize))
  }

  return params.toString()
}

export function buildPageNumbers(current: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = new Set<number>([1, totalPages, current])

  for (let offset = -1; offset <= 1; offset += 1) {
    const value = current + offset
    if (value > 1 && value < totalPages) {
      pages.add(value)
    }
  }

  const sorted = [...pages].sort((a, b) => a - b)
  const result: Array<number | "ellipsis"> = []

  for (let index = 0; index < sorted.length; index += 1) {
    const value = sorted[index]
    const previous = sorted[index - 1]
    if (previous !== undefined && value - previous > 1) {
      result.push("ellipsis")
    }
    result.push(value)
  }

  return result
}
