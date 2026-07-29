import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import {
  deleteTicketLine,
  updateTicketLine,
} from "@/lib/projects/db/tickets"
import { formatSupabaseError } from "@/lib/supabase/errors"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; lineId: string }> }
) {
  const session = await getAuthenticatedUser()
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 })
  }

  const { lineId } = await context.params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 })
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 })
  }

  const record = body as Record<string, unknown>
  const patch: {
    locationId?: string
    capacityPerScreening?: number
    screenings?: number
    invitations?: number
    ticketsSold?: number
    ticketPriceTtc?: number
    vatRate?: number
    isFree?: boolean
  } = {}

  if (typeof record.locationId === "string" && record.locationId.trim()) {
    patch.locationId = record.locationId.trim()
  }
  if (typeof record.capacityPerScreening === "number") {
    patch.capacityPerScreening = record.capacityPerScreening
  }
  if (typeof record.screenings === "number") patch.screenings = record.screenings
  if (typeof record.invitations === "number") {
    patch.invitations = record.invitations
  }
  if (typeof record.ticketsSold === "number") {
    patch.ticketsSold = record.ticketsSold
  }
  if (typeof record.ticketPriceTtc === "number") {
    patch.ticketPriceTtc = record.ticketPriceTtc
  }
  if (typeof record.vatRate === "number") patch.vatRate = record.vatRate
  if (typeof record.isFree === "boolean") patch.isFree = record.isFree

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Aucune modification fournie." }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    const line = await updateTicketLine(supabase, lineId, patch)
    return NextResponse.json({ line })
  } catch (error) {
    return NextResponse.json(
      { error: formatSupabaseError(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string; lineId: string }> }
) {
  const session = await getAuthenticatedUser()
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 })
  }

  const { lineId } = await context.params
  const supabase = await createClient()

  try {
    await deleteTicketLine(supabase, lineId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: formatSupabaseError(error) },
      { status: 500 }
    )
  }
}
