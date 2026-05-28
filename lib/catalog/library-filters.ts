import { albumFormatOptions } from "@/lib/catalog/format-labels"
import type { AlbumFormat, AlbumSummary } from "@/lib/catalog/types"

export const LIBRARY_FILTER_ALL = "all"

export type LibraryFilters = {
  query: string
  genre: string
  subgenre: string
  tag: string
  country: string
  format: string
  yearFrom: string
  yearTo: string
  minMinoRating: string
}

export type LibraryFilterOptions = {
  genres: string[]
  subgenres: string[]
  tags: string[]
  countries: string[]
  years: number[]
  formats: AlbumFormat[]
}

export const defaultLibraryFilters: LibraryFilters = {
  query: "",
  genre: LIBRARY_FILTER_ALL,
  subgenre: LIBRARY_FILTER_ALL,
  tag: LIBRARY_FILTER_ALL,
  country: LIBRARY_FILTER_ALL,
  format: LIBRARY_FILTER_ALL,
  yearFrom: LIBRARY_FILTER_ALL,
  yearTo: LIBRARY_FILTER_ALL,
  minMinoRating: LIBRARY_FILTER_ALL,
}

function uniqueSorted(values: string[]) {
  return [...new Set(values.filter((value) => value.length > 0))].sort((a, b) =>
    a.localeCompare(b, "fr")
  )
}

function readParam(
  params: URLSearchParams,
  key: string,
  fallback = LIBRARY_FILTER_ALL
) {
  const value = params.get(key)?.trim()
  return value && value.length > 0 ? value : fallback
}

export function parseLibraryFiltersFromSearchParams(
  params: URLSearchParams
): LibraryFilters {
  return {
    query: params.get("q")?.trim() ?? "",
    genre: readParam(params, "genre"),
    subgenre: readParam(params, "subgenre"),
    tag: readParam(params, "tag"),
    country: readParam(params, "country"),
    format: readParam(params, "format"),
    yearFrom: readParam(params, "yearFrom"),
    yearTo: readParam(params, "yearTo"),
    minMinoRating: readParam(params, "minRating"),
  }
}

export function serializeLibraryFiltersToSearchParams(
  filters: LibraryFilters
): string {
  const params = new URLSearchParams()

  if (filters.query.trim()) params.set("q", filters.query.trim())
  if (filters.genre !== LIBRARY_FILTER_ALL) params.set("genre", filters.genre)
  if (filters.subgenre !== LIBRARY_FILTER_ALL)
    params.set("subgenre", filters.subgenre)
  if (filters.tag !== LIBRARY_FILTER_ALL) params.set("tag", filters.tag)
  if (filters.country !== LIBRARY_FILTER_ALL)
    params.set("country", filters.country)
  if (filters.format !== LIBRARY_FILTER_ALL)
    params.set("format", filters.format)
  if (filters.yearFrom !== LIBRARY_FILTER_ALL)
    params.set("yearFrom", filters.yearFrom)
  if (filters.yearTo !== LIBRARY_FILTER_ALL) params.set("yearTo", filters.yearTo)
  if (filters.minMinoRating !== LIBRARY_FILTER_ALL)
    params.set("minRating", filters.minMinoRating)

  return params.toString()
}

export function deriveLibraryFilterOptions(
  albums: AlbumSummary[],
  selectedGenre: string
): LibraryFilterOptions {
  const genreScoped =
    selectedGenre !== LIBRARY_FILTER_ALL
      ? albums.filter((album) => album.genreName === selectedGenre)
      : albums

  const formats = albumFormatOptions.filter((format) =>
    albums.some((album) => album.format === format)
  )

  const years = [
    ...new Set(
      albums
        .map((album) => album.releaseYear)
        .filter((year) => year > 0)
    ),
  ].sort((a, b) => b - a)

  return {
    genres: uniqueSorted(albums.map((album) => album.genreName)),
    subgenres: uniqueSorted(genreScoped.map((album) => album.subgenreName)),
    tags: uniqueSorted(albums.flatMap((album) => album.tags)),
    countries: uniqueSorted(albums.map((album) => album.country)),
    years,
    formats,
  }
}

export function countActiveLibraryFilters(filters: LibraryFilters) {
  let count = 0
  if (filters.query.trim()) count += 1
  if (filters.genre !== LIBRARY_FILTER_ALL) count += 1
  if (filters.subgenre !== LIBRARY_FILTER_ALL) count += 1
  if (filters.tag !== LIBRARY_FILTER_ALL) count += 1
  if (filters.country !== LIBRARY_FILTER_ALL) count += 1
  if (filters.format !== LIBRARY_FILTER_ALL) count += 1
  if (filters.yearFrom !== LIBRARY_FILTER_ALL) count += 1
  if (filters.yearTo !== LIBRARY_FILTER_ALL) count += 1
  if (filters.minMinoRating !== LIBRARY_FILTER_ALL) count += 1
  return count
}

export function hasActiveLibraryFilters(filters: LibraryFilters) {
  return countActiveLibraryFilters(filters) > 0
}
