import type { SupabaseClient, User } from "@supabase/supabase-js"

import { ensureProfile } from "@/lib/auth/ensure-profile"
import { roundMoney } from "@/lib/format/money"
import type {
  BudgetLineCreateInput,
  BudgetLineUpdateInput,
  ProjectBudget,
  ProjectBudgetLine,
} from "@/lib/projects/finance-types"

type CategoryEmbed = {
  id: string
  code: string
  label: string
  sort_order: number
  is_active: boolean
}

type BudgetLineRow = {
  id: string
  budgeted_amount: number | string
  engaged_amount: number | string
  sort_order: number
  notes: string
  budget_categories: CategoryEmbed | CategoryEmbed[] | null
}

type BudgetRow = {
  id: string
  project_id: string
  project_budget_lines: BudgetLineRow[] | null
}

const budgetSelect = `
  id,
  project_id,
  project_budget_lines (
    id,
    budgeted_amount,
    engaged_amount,
    sort_order,
    notes,
    budget_categories (
      id,
      code,
      label,
      sort_order,
      is_active
    )
  )
`

function readEmbed<T>(value: T | T[] | null): T | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

function toAmount(value: number | string) {
  return roundMoney(typeof value === "number" ? value : Number(value))
}

function mapBudgetLine(row: BudgetLineRow): ProjectBudgetLine {
  const category = readEmbed(row.budget_categories)
  if (!category) throw new Error("Ligne budget sans catégorie.")

  return {
    id: row.id,
    categoryId: category.id,
    categoryCode: category.code,
    categoryLabel: category.label,
    budgetedAmount: toAmount(row.budgeted_amount),
    engagedAmount: toAmount(row.engaged_amount),
    sortOrder: row.sort_order,
    notes: row.notes ?? "",
  }
}

function mapBudget(row: BudgetRow): ProjectBudget {
  const lines = [...(row.project_budget_lines ?? [])]
    .map(mapBudgetLine)
    .sort(
      (a, b) =>
        a.sortOrder - b.sortOrder ||
        a.categoryLabel.localeCompare(b.categoryLabel, "fr")
    )

  const budgetedTotal = roundMoney(
    lines.reduce((sum, line) => sum + line.budgetedAmount, 0)
  )
  const engagedTotal = roundMoney(
    lines.reduce((sum, line) => sum + line.engagedAmount, 0)
  )

  return {
    id: row.id,
    projectId: row.project_id,
    lines,
    budgetedTotal,
    engagedTotal,
    remainingTotal: roundMoney(budgetedTotal - engagedTotal),
  }
}

export async function ensureProjectBudget(
  supabase: SupabaseClient,
  user: User,
  projectId: string
): Promise<ProjectBudget> {
  await ensureProfile(supabase, user)

  const existing = await getProjectBudget(supabase, projectId)
  if (existing) return existing

  const { data, error } = await supabase
    .from("project_budgets")
    .insert({
      project_id: projectId,
      created_by: user.id,
    })
    .select(budgetSelect)
    .single()

  if (error) {
    const raced = await getProjectBudget(supabase, projectId)
    if (raced) return raced
    throw error
  }

  return mapBudget(data as unknown as BudgetRow)
}

export async function getProjectBudget(
  supabase: SupabaseClient,
  projectId: string
): Promise<ProjectBudget | null> {
  const { data, error } = await supabase
    .from("project_budgets")
    .select(budgetSelect)
    .eq("project_id", projectId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  return mapBudget(data as unknown as BudgetRow)
}

export async function createBudgetLine(
  supabase: SupabaseClient,
  budgetId: string,
  input: BudgetLineCreateInput
): Promise<ProjectBudgetLine> {
  const { data: maxRow } = await supabase
    .from("project_budget_lines")
    .select("sort_order")
    .eq("budget_id", budgetId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle()

  const sortOrder =
    typeof maxRow?.sort_order === "number" ? maxRow.sort_order + 10 : 0

  const { data, error } = await supabase
    .from("project_budget_lines")
    .insert({
      budget_id: budgetId,
      category_id: input.categoryId,
      budgeted_amount: input.budgetedAmount ?? 0,
      engaged_amount: input.engagedAmount ?? 0,
      notes: (input.notes ?? "").trim(),
      sort_order: sortOrder,
    })
    .select(
      `
      id,
      budgeted_amount,
      engaged_amount,
      sort_order,
      notes,
      budget_categories (
        id,
        code,
        label,
        sort_order,
        is_active
      )
    `
    )
    .single()

  if (error) throw error
  return mapBudgetLine(data as unknown as BudgetLineRow)
}

export async function updateBudgetLine(
  supabase: SupabaseClient,
  lineId: string,
  input: BudgetLineUpdateInput
): Promise<ProjectBudgetLine> {
  const patch: Record<string, unknown> = {}
  if (input.categoryId !== undefined) patch.category_id = input.categoryId
  if (input.budgetedAmount !== undefined) {
    patch.budgeted_amount = input.budgetedAmount
  }
  if (input.engagedAmount !== undefined) {
    patch.engaged_amount = input.engagedAmount
  }
  if (input.notes !== undefined) patch.notes = input.notes.trim()

  const { data, error } = await supabase
    .from("project_budget_lines")
    .update(patch)
    .eq("id", lineId)
    .select(
      `
      id,
      budgeted_amount,
      engaged_amount,
      sort_order,
      notes,
      budget_categories (
        id,
        code,
        label,
        sort_order,
        is_active
      )
    `
    )
    .single()

  if (error) throw error
  return mapBudgetLine(data as unknown as BudgetLineRow)
}

export async function deleteBudgetLine(
  supabase: SupabaseClient,
  lineId: string
) {
  const { error } = await supabase
    .from("project_budget_lines")
    .delete()
    .eq("id", lineId)

  if (error) throw error
}
