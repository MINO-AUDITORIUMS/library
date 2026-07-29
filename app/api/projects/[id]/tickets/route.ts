import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import {
  createTicketLine,
  listProjectTicketLines,
} from "@/lib/projects/db/tickets"
import { formatSupabaseError } from "@/lib/supabase/errors"
import { createClient } from "@/lib/supabase/server"

export async function GET(
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
    const lines = await listProjectTicketLines(supabase, id)
    return NextResponse.json({ lines })
  } catch (error) {
    return NextResponse.json(
      { error: formatSupabaseError(error) },
      { status: 500 }
    )
  }
}

export async function POST(
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

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 })
  }

  const record = body as Record<string, unknown>
  const locationId =
    typeof record.locationId === "string" ? record.locationId.trim() : ""
  if (!locationId) {
    return NextResponse.json({ error: "Lieu requis." }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    const line = await createTicketLine(supabase, id, {
      locationId,
      capacityPerScreening:
        typeof record.capacityPerScreening === "number"
          ? record.capacityPerScreening
          : 0,
      screenings:
        typeof record.screenings === "number" ? record.screenings : 1,
      invitations:
        typeof record.invitations === "number" ? record.invitations : 0,
      ticketsSold:
        typeof record.ticketsSold === "number" ? record.ticketsSold : 0,
      ticketPriceTtc:
        typeof record.ticketPriceTtc === "number" ? record.ticketPriceTtc : 0,
      vatRate: typeof record.vatRate === "number" ? record.vatRate : 5.5,
      isFree: record.isFree === true,
    })
    return NextResponse.json({ line }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: formatSupabaseError(error) },
      { status: 500 }
    )
  }
}
