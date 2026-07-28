import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import {
  deleteProject,
  getProjectById,
  updateProject,
} from "@/lib/projects/db/projects"
import { formatSupabaseError } from "@/lib/supabase/errors"
import { createClient } from "@/lib/supabase/server"

function parseUpdateBody(body: unknown) {
  if (!body || typeof body !== "object") return null

  const record = body as Record<string, unknown>
  const patch: {
    code?: string
    title?: string
    albumId?: string
    typeId?: string
    statusId?: string
    primaryLocationId?: string | null
    eventDate?: string | null
    eventEndDate?: string | null
    comment?: string
  } = {}

  if (typeof record.code === "string" && record.code.trim()) {
    patch.code = record.code.trim()
  }
  if (typeof record.title === "string" && record.title.trim()) {
    patch.title = record.title.trim()
  }
  if (typeof record.albumId === "string" && record.albumId.trim()) {
    patch.albumId = record.albumId.trim()
  }
  if (typeof record.typeId === "string" && record.typeId.trim()) {
    patch.typeId = record.typeId.trim()
  }
  if (typeof record.statusId === "string" && record.statusId.trim()) {
    patch.statusId = record.statusId.trim()
  }
  if ("primaryLocationId" in record) {
    patch.primaryLocationId =
      typeof record.primaryLocationId === "string" &&
      record.primaryLocationId.trim()
        ? record.primaryLocationId.trim()
        : null
  }
  if ("eventDate" in record) {
    patch.eventDate =
      typeof record.eventDate === "string" && record.eventDate.trim()
        ? record.eventDate.trim()
        : null
  }
  if ("eventEndDate" in record) {
    patch.eventEndDate =
      typeof record.eventEndDate === "string" && record.eventEndDate.trim()
        ? record.eventEndDate.trim()
        : null
  }
  if (typeof record.comment === "string") {
    patch.comment = record.comment
  }

  return Object.keys(patch).length > 0 ? patch : null
}

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
    const project = await getProjectById(supabase, id)
    if (!project) {
      return NextResponse.json({ error: "Projet introuvable." }, { status: 404 })
    }
    return NextResponse.json({ project })
  } catch (error) {
    return NextResponse.json(
      { error: formatSupabaseError(error) },
      { status: 500 }
    )
  }
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
    const project = await updateProject(supabase, id, patch)
    return NextResponse.json({ project })
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
    await deleteProject(supabase, id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: formatSupabaseError(error) },
      { status: 500 }
    )
  }
}
