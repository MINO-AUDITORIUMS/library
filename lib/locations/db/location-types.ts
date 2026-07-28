import type { SupabaseClient, User } from "@supabase/supabase-js"

import { ensureProfile } from "@/lib/auth/ensure-profile"
import { slugify } from "@/lib/catalog/slug"
import type { LocationType } from "@/lib/locations/types"

type LocationTypeRow = {
  id: string
  code: string
  label: string
  sort_order: number
  is_active: boolean
}

function mapLocationTypeRow(row: LocationTypeRow): LocationType {
  return {
    id: row.id,
    code: row.code,
    label: row.label,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  }
}

export async function listLocationTypes(
  supabase: SupabaseClient
): Promise<LocationType[]> {
  const { data, error } = await supabase
    .from("location_types")
    .select("id, code, label, sort_order, is_active")
    .order("sort_order", { ascending: true })
    .order("label", { ascending: true })

  if (error) throw error
  return ((data ?? []) as LocationTypeRow[]).map(mapLocationTypeRow)
}

export async function createLocationType(
  supabase: SupabaseClient,
  user: User,
  label: string
): Promise<LocationType | null> {
  const trimmed = label.trim()
  if (!trimmed) return null

  const code = slugify(trimmed)
  if (!code) return null

  await ensureProfile(supabase, user)

  const { data: existing, error: findError } = await supabase
    .from("location_types")
    .select("id, code, label, sort_order, is_active")
    .eq("code", code)
    .maybeSingle()

  if (findError) throw findError
  if (existing) {
    return mapLocationTypeRow(existing as LocationTypeRow)
  }

  const { data: maxRow } = await supabase
    .from("location_types")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle()

  const sortOrder =
    typeof maxRow?.sort_order === "number" ? maxRow.sort_order + 10 : 100

  const { data, error } = await supabase
    .from("location_types")
    .insert({
      code,
      label: trimmed,
      sort_order: sortOrder,
      created_by: user.id,
    })
    .select("id, code, label, sort_order, is_active")
    .single()

  if (error) {
    const { data: retry } = await supabase
      .from("location_types")
      .select("id, code, label, sort_order, is_active")
      .eq("code", code)
      .maybeSingle()

    if (retry) return mapLocationTypeRow(retry as LocationTypeRow)
    throw error
  }

  return mapLocationTypeRow(data as LocationTypeRow)
}

export async function updateLocationType(
  supabase: SupabaseClient,
  typeId: string,
  label: string
): Promise<LocationType> {
  const trimmed = label.trim()
  if (!trimmed) throw new Error("Libellé requis.")

  const { data, error } = await supabase
    .from("location_types")
    .update({ label: trimmed })
    .eq("id", typeId)
    .select("id, code, label, sort_order, is_active")
    .single()

  if (error) throw error
  return mapLocationTypeRow(data as LocationTypeRow)
}

export async function deleteLocationType(
  supabase: SupabaseClient,
  typeId: string
) {
  const { count, error: countError } = await supabase
    .from("locations")
    .select("id", { count: "exact", head: true })
    .eq("location_type_id", typeId)

  if (countError) throw countError
  if ((count ?? 0) > 0) {
    throw new Error("Ce type est utilisé par un ou plusieurs lieux.")
  }

  const { error } = await supabase
    .from("location_types")
    .delete()
    .eq("id", typeId)

  if (error) throw error
}
