import type { SupabaseClient } from "@supabase/supabase-js"

import type { ProjectStatus } from "@/lib/projects/types"

type ProjectStatusRow = {
  id: string
  code: string
  label: string
  sort_order: number
  is_active: boolean
}

export function mapProjectStatusRow(row: ProjectStatusRow): ProjectStatus {
  return {
    id: row.id,
    code: row.code,
    label: row.label,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  }
}

export async function listProjectStatuses(
  supabase: SupabaseClient
): Promise<ProjectStatus[]> {
  const { data, error } = await supabase
    .from("project_statuses")
    .select("id, code, label, sort_order, is_active")
    .order("sort_order", { ascending: true })
    .order("label", { ascending: true })

  if (error) throw error
  return ((data ?? []) as ProjectStatusRow[]).map(mapProjectStatusRow)
}

export async function getProjectStatusByCode(
  supabase: SupabaseClient,
  code: string
): Promise<ProjectStatus | null> {
  const { data, error } = await supabase
    .from("project_statuses")
    .select("id, code, label, sort_order, is_active")
    .eq("code", code)
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  return mapProjectStatusRow(data as ProjectStatusRow)
}
