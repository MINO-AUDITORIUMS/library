import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import {
  createLocation,
  listLocations,
} from "@/lib/locations/db/locations"
import { formatSupabaseError } from "@/lib/supabase/errors"
import { createClient } from "@/lib/supabase/server"

function parseCreateBody(body: unknown) {
  if (!body || typeof body !== "object") return null

  const record = body as Record<string, unknown>
  const name = typeof record.name === "string" ? record.name.trim() : ""
  const typeId = typeof record.typeId === "string" ? record.typeId.trim() : ""
  const address = typeof record.address === "string" ? record.address.trim() : ""
  const city = typeof record.city === "string" ? record.city.trim() : ""
  const longitude =
    typeof record.longitude === "number"
      ? record.longitude
      : typeof record.longitude === "string"
        ? Number(record.longitude)
        : NaN
  const latitude =
    typeof record.latitude === "number"
      ? record.latitude
      : typeof record.latitude === "string"
        ? Number(record.latitude)
        : NaN

  if (!name || !typeId || !address || !city) return null
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return null

  return { name, typeId, address, city, longitude, latitude }
}

export async function GET() {
  const session = await getAuthenticatedUser()
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 })
  }

  const supabase = await createClient()

  try {
    const locations = await listLocations(supabase)
    return NextResponse.json({ locations })
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
      { error: "Nom, type, adresse, ville et coordonnées sont requis." },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  try {
    const location = await createLocation(supabase, session.user, input)
    return NextResponse.json({ location }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: formatSupabaseError(error) },
      { status: 500 }
    )
  }
}
