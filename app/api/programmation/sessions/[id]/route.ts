import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import { deleteSession, updateSession } from "@/lib/programmation/db/sessions"
import type { SessionStatus } from "@/lib/programmation/types"
import { formatSupabaseError } from "@/lib/supabase/errors"
import { createClient } from "@/lib/supabase/server"

const SESSION_STATUSES: SessionStatus[] = [
  "brouillon",
  "confirmee",
  "passee",
  "annulee",
]

function parseUpdateBody(body: unknown) {
  if (!body || typeof body !== "object") return null

  const record = body as Record<string, unknown>
  const patch: {
    albumId?: string
    date?: string
    startTime?: string
    notes?: string
    status?: SessionStatus
  } = {}

  if (typeof record.albumId === "string" && record.albumId.trim()) {
    patch.albumId = record.albumId.trim()
  }
  if (typeof record.date === "string" && record.date.trim()) {
    patch.date = record.date.trim()
  }
  if (typeof record.startTime === "string" && record.startTime.trim()) {
    patch.startTime = record.startTime.trim()
  }
  if (typeof record.notes === "string") {
    patch.notes = record.notes
  }
  if (
    typeof record.status === "string" &&
    SESSION_STATUSES.includes(record.status as SessionStatus)
  ) {
    patch.status = record.status as SessionStatus
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
    const updated = await updateSession(supabase, id, patch)
    return NextResponse.json({ session: updated })
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
    await deleteSession(supabase, id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: formatSupabaseError(error) },
      { status: 500 }
    )
  }
}
