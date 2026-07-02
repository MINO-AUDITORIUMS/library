import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import { fetchLibraryAlbumsPage } from "@/lib/catalog/db/library-list"
import { parseLibraryStateFromSearchParams } from "@/lib/catalog/library-pagination"
import { formatSupabaseError } from "@/lib/supabase/errors"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const session = await getAuthenticatedUser()
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const { filters, pagination } = parseLibraryStateFromSearchParams(searchParams)

  const supabase = await createClient()

  try {
    const pageData = await fetchLibraryAlbumsPage(
      supabase,
      filters,
      pagination
    )

    return NextResponse.json(pageData)
  } catch (error) {
    return NextResponse.json(
      { error: formatSupabaseError(error) },
      { status: 500 }
    )
  }
}
