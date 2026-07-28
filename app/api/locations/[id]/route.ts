import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import {
  deleteLocation,
  updateLocation,
} from "@/lib/locations/db/locations"
import { formatSupabaseError } from "@/lib/supabase/errors"
import { createClient } from "@/lib/supabase/server"

function parseUpdateBody(body: unknown) {
  if (!body || typeof body !== "object") return null

  const record = body as Record<string, unknown>
  const patch: {
    name?: string
    typeId?: string
    address?: string
    city?: string
    longitude?: number
    latitude?: number
  } = {}

  if (typeof record.name === "string" && record.name.trim()) {
    patch.name = record.name.trim()
  }
  if (typeof record.typeId === "string" && record.typeId.trim()) {
    patch.typeId = record.typeId.trim()
  }
  if (typeof record.address === "string") {
    patch.address = record.address.trim()
  }
  if (typeof record.city === "string") {
    patch.city = record.city.trim()
  }
  if (typeof record.longitude === "number" && Number.isFinite(record.longitude)) {
    patch.longitude = record.longitude
  }
  if (typeof record.latitude === "number" && Number.isFinite(record.latitude)) {
    patch.latitude = record.latitude
  }

  return Object.keys(patch).length > 0 ? patch : null
}

export async function PATCH(
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

  const patch = parseUpdateBody(body)
  if (!patch) {
    return NextResponse.json({ error: "Aucune modification fournie." }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    const location = await updateLocation(supabase, id, patch)
    return NextResponse.json({ location })
  } catch (error) {
    return NextResponse.json(
      { error: formatSupabaseError(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
    await deleteLocation(supabase, id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: formatSupabaseError(error) },
      { status: 500 }
    )
  }
}
