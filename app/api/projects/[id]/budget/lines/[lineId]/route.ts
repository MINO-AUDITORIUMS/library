import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import {
  deleteBudgetLine,
  getProjectBudget,
  updateBudgetLine,
} from "@/lib/projects/db/budgets"
import { formatSupabaseError } from "@/lib/supabase/errors"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; lineId: string }> }
) {
  const session = await getAuthenticatedUser()
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 })
  }

  const { id, lineId } = await context.params

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
  const patch: {
    categoryId?: string
    budgetedAmount?: number
    engagedAmount?: number
    notes?: string
  } = {}

  if (typeof record.categoryId === "string" && record.categoryId.trim()) {
    patch.categoryId = record.categoryId.trim()
  }
  if (typeof record.budgetedAmount === "number") {
    patch.budgetedAmount = record.budgetedAmount
  }
  if (typeof record.engagedAmount === "number") {
    patch.engagedAmount = record.engagedAmount
  }
  if (typeof record.notes === "string") {
    patch.notes = record.notes
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Aucune modification fournie." }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    const line = await updateBudgetLine(supabase, lineId, patch)
    const budget = await getProjectBudget(supabase, id)
    return NextResponse.json({ line, budget })
  } catch (error) {
    return NextResponse.json(
      { error: formatSupabaseError(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string; lineId: string }> }
) {
  const session = await getAuthenticatedUser()
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 })
  }

  const { id, lineId } = await context.params
  const supabase = await createClient()

  try {
    await deleteBudgetLine(supabase, lineId)
    const budget = await getProjectBudget(supabase, id)
    return NextResponse.json({ ok: true, budget })
  } catch (error) {
    return NextResponse.json(
      { error: formatSupabaseError(error) },
      { status: 500 }
    )
  }
}
