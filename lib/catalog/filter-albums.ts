import type { LibraryFilters } from "@/lib/catalog/library-filters"
import { LIBRARY_FILTER_ALL } from "@/lib/catalog/library-filters"
import type { AlbumSummary } from "@/lib/catalog/types"

function parseYear(value: string) {
  const year = Number.parseInt(value, 10)
  return Number.isFinite(year) ? year : null
}

export function matchesLibraryQuery(album: AlbumSummary, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true

  const haystack = [
    album.title,
    album.artist,
    album.label,
    album.genre,
    album.genreName,
    album.subgenreName,
    album.country,
    ...album.tags,
  ]

  return haystack.some((value) => value.toLowerCase().includes(q))
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

    if (
      filters.format !== LIBRARY_FILTER_ALL &&
      album.format !== filters.format
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
