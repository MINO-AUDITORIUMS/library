import type { SupabaseClient } from "@supabase/supabase-js"

import type { ProjectType } from "@/lib/projects/types"

type ProjectTypeRow = {
  id: string
  code: string
  label: string
  family: string
  sort_order: number
  is_active: boolean
}

export function mapProjectTypeRow(row: ProjectTypeRow): ProjectType {
  return {
    id: row.id,
    code: row.code,
    label: row.label,
    family: row.family,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  }
}

export async function listProjectTypes(
  supabase: SupabaseClient
): Promise<ProjectType[]> {
  const { data, error } = await supabase
    .from("project_types")
    .select("id, code, label, family, sort_order, is_active")
    .order("sort_order", { ascending: true })
    .order("label", { ascending: true })

  if (error) throw error
  return ((data ?? []) as ProjectTypeRow[]).map(mapProjectTypeRow)
}
