import type { AlbumSummary } from "@/lib/catalog/types"
import {
  LIBRARY_FILTER_ALL,
  type LibraryFilters,
} from "@/lib/catalog/library-filters"

function parseYear(value: string) {
  if (value === LIBRARY_FILTER_ALL) return null
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : null
}

export function matchesLibraryQuery(album: AlbumSummary, query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true

  const haystack = [
    album.title,
    album.artist,
    album.label,
    album.genreName,
    album.subgenreName,
    album.country,
    ...album.tags,
  ]
    .join(" ")
    .toLowerCase()

  return haystack.includes(normalized)
}

export function filterAlbums(
  albums: AlbumSummary[],
  filters: LibraryFilters
): AlbumSummary[] {
  return albums.filter((album) => {
    if (!matchesLibraryQuery(album, filters.query)) return false

    if (
      filters.genre !== LIBRARY_FILTER_ALL &&
      album.genreName !== filters.genre
    ) {
      return false
    }

    if (
      filters.subgenre !== LIBRARY_FILTER_ALL &&
      album.subgenreName !== filters.subgenre
    ) {
      return false
    }

    if (filters.tag !== LIBRARY_FILTER_ALL && !album.tags.includes(filters.tag)) {
      return false
    }

    if (
      filters.country !== LIBRARY_FILTER_ALL &&
      album.country !== filters.country
    ) {
      return false
    }

    const yearFrom = parseYear(filters.yearFrom)
    if (yearFrom !== null) {
      if (!album.releaseYear || album.releaseYear < yearFrom) return false
    }

    const yearTo = parseYear(filters.yearTo)
    if (yearTo !== null) {
      if (!album.releaseYear || album.releaseYear > yearTo) return false
    }

    const minRating = parseYear(filters.minMinoRating)
    if (minRating !== null) {
      if (
        album.minoRating.average === null ||
        album.minoRating.average < minRating
      ) {
        return false
      }
    }

    return true
  })
}

