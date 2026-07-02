import type { SupabaseClient } from "@supabase/supabase-js"
import { cache } from "react"

import { countAlbums } from "@/lib/catalog/db/albums"
import { getLibraryFilterOptions } from "@/lib/catalog/db/library-list"

export const getRequestCachedLibraryFilterOptions = cache(
  async (supabase: SupabaseClient, genre: string) => {
    return getLibraryFilterOptions(supabase, genre)
  }
)

export const getRequestCachedTotalAlbumCount = cache(
  async (supabase: SupabaseClient) => {
    return countAlbums(supabase)
  }
)
