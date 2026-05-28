import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import { createTag, listTags } from "@/lib/catalog/db/tags"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const session = await getAuthenticatedUser()
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 })
  }

  const supabase = await createClient()

  try {
    const tags = await listTags(supabase)
    return NextResponse.json({ tags })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Impossible de charger les tags."
    return NextResponse.json({ error: message }, { status: 500 })
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

  const name =
    body && typeof body === "object" && typeof (body as { name?: unknown }).name === "string"
      ? (body as { name: string }).name.trim()
      : ""

  if (!name) {
    return NextResponse.json({ error: "Nom de tag requis." }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    const tag = await createTag(supabase, session.user, name)
    if (!tag) {
      return NextResponse.json({ error: "Tag invalide." }, { status: 400 })
    }
    return NextResponse.json({ tag }, { status: 201 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Impossible de créer le tag."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
