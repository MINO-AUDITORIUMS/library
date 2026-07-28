import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import {
  createLocationType,
  listLocationTypes,
} from "@/lib/locations/db/location-types"
import { formatSupabaseError } from "@/lib/supabase/errors"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const session = await getAuthenticatedUser()
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 })
  }

  const supabase = await createClient()

  try {
    const types = await listLocationTypes(supabase)
    return NextResponse.json({ types })
  } catch (error) {
    return NextResponse.json(
      { error: formatSupabaseError(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await getAuthenticatedUser()
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 })
  }

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
    const type = await createLocationType(supabase, session.user, label)
    if (!type) {
      return NextResponse.json({ error: "Type invalide." }, { status: 400 })
    }
    return NextResponse.json({ type }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: formatSupabaseError(error) },
      { status: 500 }
    )
  }
}
