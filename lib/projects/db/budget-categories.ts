import type { SupabaseClient } from "@supabase/supabase-js"

import type { BudgetCategory } from "@/lib/projects/finance-types"

type BudgetCategoryRow = {
  id: string
  code: string
  label: string
  sort_order: number
  is_active: boolean
}

export function mapBudgetCategoryRow(row: BudgetCategoryRow): BudgetCategory {
  return {
    id: row.id,
    code: row.code,
    label: row.label,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  }
}

export async function listBudgetCategories(
  supabase: SupabaseClient
): Promise<BudgetCategory[]> {
  const { data, error } = await supabase
    .from("budget_categories")
    .select("id, code, label, sort_order, is_active")
    .order("sort_order", { ascending: true })
    .order("label", { ascending: true })

  if (error) throw error
  return ((data ?? []) as BudgetCategoryRow[]).map(mapBudgetCategoryRow)
}
