import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import {
  deleteLocationRoom,
  updateLocationRoom,
} from "@/lib/locations/db/locations"
import { formatSupabaseError } from "@/lib/supabase/errors"
import { createClient } from "@/lib/supabase/server"

function parseCapacity(body: unknown) {
  if (!body || typeof body !== "object") return undefined
  const record = body as Record<string, unknown>
  if (!("capacity" in record)) return undefined
  if (record.capacity === null) return null
  if (typeof record.capacity === "number" && Number.isFinite(record.capacity)) {
    return Math.floor(record.capacity)
  }
  return undefined
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; roomId: string }> }
) {
  const session = await getAuthenticatedUser()
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 })
  }

  const { roomId } = await context.params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 })
  }

  const capacity = parseCapacity(body)
  if (capacity === undefined) {
    return NextResponse.json({ error: "Capacité requise." }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    const room = await updateLocationRoom(supabase, roomId, { capacity })
    return NextResponse.json({ room })
  } catch (error) {
    return NextResponse.json(
      { error: formatSupabaseError(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string; roomId: string }> }
) {
  const session = await getAuthenticatedUser()
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 })
  }

  const { roomId } = await context.params
  const supabase = await createClient()

  try {
    await deleteLocationRoom(supabase, roomId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: formatSupabaseError(error) },
      { status: 500 }
    )
  }
}
