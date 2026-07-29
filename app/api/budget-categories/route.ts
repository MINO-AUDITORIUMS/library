import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import { listBudgetCategories } from "@/lib/projects/db/budget-categories"
import { formatSupabaseError } from "@/lib/supabase/errors"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const session = await getAuthenticatedUser()
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 })
  }

  const supabase = await createClient()

  try {
    const categories = await listBudgetCategories(supabase)
    return NextResponse.json({ categories })
  } catch (error) {
    return NextResponse.json(
      { error: formatSupabaseError(error) },
      { status: 500 }
    )
  }
}
