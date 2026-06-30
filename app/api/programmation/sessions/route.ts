import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import {
  createSession,
  listSessions,
} from "@/lib/programmation/db/sessions"
import type { SessionStatus } from "@/lib/programmation/types"
import { formatSupabaseError } from "@/lib/supabase/errors"
import { createClient } from "@/lib/supabase/server"

const SESSION_STATUSES: SessionStatus[] = [
  "brouillon",
  "confirmee",
  "passee",
  "annulee",
]

function parseCreateBody(body: unknown) {
  if (!body || typeof body !== "object") return null

  const record = body as Record<string, unknown>
  const albumId = typeof record.albumId === "string" ? record.albumId.trim() : ""
  const date = typeof record.date === "string" ? record.date.trim() : ""
  const startTime =
    typeof record.startTime === "string" ? record.startTime.trim() : ""
  const notes = typeof record.notes === "string" ? record.notes : ""
  const status =
    typeof record.status === "string" &&
    SESSION_STATUSES.includes(record.status as SessionStatus)
      ? (record.status as SessionStatus)
      : "brouillon"

  if (!albumId || !date || !startTime) return null

  return { albumId, date, startTime, notes, status }
}

export async function GET() {
  const session = await getAuthenticatedUser()
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 })
  }

  const supabase = await createClient()

  try {
    const sessions = await listSessions(supabase)
    return NextResponse.json({ sessions })
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

  const input = parseCreateBody(body)
  if (!input) {
    return NextResponse.json(
      { error: "Album, date et heure sont requis." },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  try {
    const created = await createSession(supabase, session.user, input)
    return NextResponse.json({ session: created }, { status: 201 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : formatSupabaseError(error)
    const status = message.includes("introuvable") ? 404 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
