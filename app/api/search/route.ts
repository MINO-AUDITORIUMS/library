import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import { runGlobalSearch } from "@/lib/catalog/db/global-search"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const session = await getAuthenticatedUser()
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.trim() ?? ""

  if (query.length < 2) {
    return NextResponse.json(
      { error: "La recherche doit contenir au moins 2 caractères." },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  try {
    const results = await runGlobalSearch(supabase, query)
    return NextResponse.json(results)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Impossible de lancer la recherche."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
