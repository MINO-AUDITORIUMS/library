import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import {
  deleteLocationType,
  updateLocationType,
} from "@/lib/locations/db/location-types"
import { formatSupabaseError } from "@/lib/supabase/errors"
import { createClient } from "@/lib/supabase/server"

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

  const label =
    body && typeof body === "object" && typeof (body as { label?: unknown }).label === "string"
      ? (body as { label: string }).label.trim()
      : ""

  if (!label) {
    return NextResponse.json({ error: "Libellé requis." }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    const type = await updateLocationType(supabase, id, label)
    return NextResponse.json({ type })
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
    await deleteLocationType(supabase, id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : formatSupabaseError(error)
    const status = message.includes("utilisé") ? 409 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
