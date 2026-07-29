import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import {
  createBudgetLine,
  ensureProjectBudget,
  getProjectBudget,
} from "@/lib/projects/db/budgets"
import { formatSupabaseError } from "@/lib/supabase/errors"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getAuthenticatedUser()
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 })
  }

  const { id } = await context.params
  const supabase = await createClient()

  try {
    const budget = await ensureProjectBudget(supabase, session.user, id)
    return NextResponse.json({ budget })
  } catch (error) {
    return NextResponse.json(
      { error: formatSupabaseError(error) },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getAuthenticatedUser()
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 })
  }

  const { id } = await context.params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 })
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 })
  }

  const record = body as Record<string, unknown>
  const categoryId =
    typeof record.categoryId === "string" ? record.categoryId.trim() : ""
  if (!categoryId) {
    return NextResponse.json({ error: "Catégorie requise." }, { status: 400 })
  }

  const budgetedAmount =
    typeof record.budgetedAmount === "number" ? record.budgetedAmount : 0
  const engagedAmount =
    typeof record.engagedAmount === "number" ? record.engagedAmount : 0
  const notes = typeof record.notes === "string" ? record.notes : ""

  const supabase = await createClient()

  try {
    const budget =
      (await getProjectBudget(supabase, id)) ??
      (await ensureProjectBudget(supabase, session.user, id))

    const line = await createBudgetLine(supabase, budget.id, {
      categoryId,
      budgetedAmount,
      engagedAmount,
      notes,
    })

    const refreshed = await getProjectBudget(supabase, id)
    return NextResponse.json({ line, budget: refreshed }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: formatSupabaseError(error) },
      { status: 500 }
    )
  }
}
