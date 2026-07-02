import type { SupabaseClient } from "@supabase/supabase-js"

import { countryDisplayName, resolveCountryCode } from "@/lib/catalog/country-code"
import {
  listAlbumSummariesByIds,
} from "@/lib/catalog/db/albums"
import {
  LIBRARY_FILTER_ALL,
  type LibraryFilterOptions,
  type LibraryFilters,
} from "@/lib/catalog/library-filters"
import {
  clampLibraryPage,
  type LibraryPagination,
} from "@/lib/catalog/library-pagination"
import type { AlbumSummary } from "@/lib/catalog/types"

type LibraryAlbumsPageRow = {
  origin_country_code: string | null
  countries: { name: string } | { name: string }[] | null
  release_year: number | null
}

type ListLibraryAlbumsPageResult = {
  total: number
  ids: string[]
}

function readCountryName(
  value: { name: string } | { name: string }[] | null | undefined
) {
  if (!value) return ""
  if (Array.isArray(value)) return value[0]?.name ?? ""
  return value.name
}

function uniqueSorted(values: string[]) {
  return [...new Set(values.filter((value) => value.length > 0))].sort((a, b) =>
    a.localeCompare(b, "fr")
  )
}

function parseYearFilter(value: string) {
  if (value === LIBRARY_FILTER_ALL) return null
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : null
}

function parseMinMinoRatingFilter(value: string) {
  if (value === LIBRARY_FILTER_ALL) return null
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : null
}

function resolveCountryFilter(country: string) {
  if (country === LIBRARY_FILTER_ALL) {
    return { country: null, countryCode: null }
  }

  const countryCode = resolveCountryCode(country)
  return {
    country,
    countryCode: countryCode ?? null,
  }
}

function mapAlbumCountry(row: LibraryAlbumsPageRow) {
  const joinedName = readCountryName(row.countries)
  if (joinedName) return joinedName
  if (row.origin_country_code) {
    return countryDisplayName(row.origin_country_code)
  }
  return ""
}

export function normalizeLibraryFilters(
  filters: LibraryFilters,
  options: LibraryFilterOptions
): LibraryFilters {
  if (
    filters.subgenre !== LIBRARY_FILTER_ALL &&
    !options.subgenres.includes(filters.subgenre)
  ) {
    return { ...filters, subgenre: LIBRARY_FILTER_ALL }
  }

  return filters
}

export async function getLibraryFilterOptions(
  supabase: SupabaseClient,
  selectedGenre: string
): Promise<LibraryFilterOptions> {
  const [genresRes, tagsRes, countryRowsRes, yearsRes, subgenresRes] =
    await Promise.all([
      supabase
        .from("album_genres")
        .select("genres!inner(name)")
        .order("name", { referencedTable: "genres" }),
      supabase
        .from("album_tags")
        .select("tags!inner(name)")
        .order("name", { referencedTable: "tags" }),
      supabase
        .from("albums")
        .select("origin_country_code, countries(name)"),
      supabase
        .from("albums")
        .select("release_year")
        .not("release_year", "is", null)
        .order("release_year", { ascending: false }),
      loadSubgenreNames(supabase, selectedGenre),
    ])

  if (genresRes.error) throw genresRes.error
  if (tagsRes.error) throw tagsRes.error
  if (countryRowsRes.error) throw countryRowsRes.error
  if (yearsRes.error) throw yearsRes.error

  const years = [
    ...new Set(
      (yearsRes.data ?? [])
        .map((row) => row.release_year)
        .filter((year): year is number => typeof year === "number" && year > 0)
    ),
  ].sort((a, b) => b - a)

  return {
    genres: uniqueSorted(
      (genresRes.data ?? []).map((row) => readCountryName(row.genres))
    ),
    subgenres: subgenresRes,
    tags: uniqueSorted(
      (tagsRes.data ?? []).map((row) => readCountryName(row.tags))
    ),
    countries: uniqueSorted(
      (countryRowsRes.data ?? []).map((row) =>
        mapAlbumCountry(row as LibraryAlbumsPageRow)
      )
    ),
    years,
  }
}

async function loadSubgenreNames(
  supabase: SupabaseClient,
  selectedGenre: string
): Promise<string[]> {
  let query = supabase
    .from("album_subgenres")
    .select("subgenres!inner(name, genres!inner(name))")
    .order("name", { referencedTable: "subgenres" })

  if (selectedGenre !== LIBRARY_FILTER_ALL) {
    query = query.eq("subgenres.genres.name", selectedGenre)
  }

  const { data, error } = await query
  if (error) throw error

  return uniqueSorted(
    (data ?? []).map((row) => readCountryName(row.subgenres))
  )
}

export type LibraryPageData = {
  albums: AlbumSummary[]
  totalFilteredCount: number
  filters: LibraryFilters
  pagination: LibraryPagination
  filterOptions: LibraryFilterOptions
}

export async function getLibraryPageData(
  supabase: SupabaseClient,
  filters: LibraryFilters,
  pagination: LibraryPagination
): Promise<LibraryPageData> {
  const filterOptions = await getLibraryFilterOptions(supabase, filters.genre)
  const normalizedFilters = normalizeLibraryFilters(filters, filterOptions)

  const { country, countryCode } = resolveCountryFilter(
    normalizedFilters.country
  )

  const { data, error } = await supabase.rpc("list_library_albums_page", {
    p_query: normalizedFilters.query.trim() || null,
    p_genre:
      normalizedFilters.genre !== LIBRARY_FILTER_ALL
        ? normalizedFilters.genre
        : null,
    p_subgenre:
      normalizedFilters.subgenre !== LIBRARY_FILTER_ALL
        ? normalizedFilters.subgenre
        : null,
    p_tag:
      normalizedFilters.tag !== LIBRARY_FILTER_ALL
        ? normalizedFilters.tag
        : null,
    p_country: country,
    p_country_code: countryCode,
    p_year_from: parseYearFilter(normalizedFilters.yearFrom),
    p_year_to: parseYearFilter(normalizedFilters.yearTo),
    p_min_mino_rating: parseMinMinoRatingFilter(
      normalizedFilters.minMinoRating
    ),
    p_page: pagination.page,
    p_page_size: pagination.pageSize,
  })

  if (error) throw error

  const result = data as ListLibraryAlbumsPageResult
  const totalFilteredCount = result.total ?? 0
  const normalizedPagination = {
    ...pagination,
    page: clampLibraryPage(
      pagination.page,
      totalFilteredCount,
      pagination.pageSize
    ),
  }

  const albums = await listAlbumSummariesByIds(supabase, result.ids ?? [])

  return {
    albums,
    totalFilteredCount,
    filters: normalizedFilters,
    pagination: normalizedPagination,
    filterOptions,
  }
}
