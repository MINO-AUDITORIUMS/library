import {
  LIBRARY_PAGE_SIZE_OPTIONS,
  type LibraryPageSize,
} from "@/lib/catalog/library-pagination"

const STORAGE_KEY = "mino.library.pageSize"

export function isLibraryPageSize(value: number): value is LibraryPageSize {
  return LIBRARY_PAGE_SIZE_OPTIONS.includes(value as LibraryPageSize)
}

export function readLibraryPageSizePreference(): LibraryPageSize | null {
  if (typeof window === "undefined") return null

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed = Number.parseInt(raw, 10)
    if (!isLibraryPageSize(parsed)) return null

    return parsed
  } catch {
    return null
  }
}

export function writeLibraryPageSizePreference(pageSize: LibraryPageSize) {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(STORAGE_KEY, String(pageSize))
  } catch {
    return
  }
}
