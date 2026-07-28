import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import { getProjectStatusByCode } from "@/lib/projects/db/project-statuses"
import { createProject, listProjects } from "@/lib/projects/db/projects"
import { formatSupabaseError } from "@/lib/supabase/errors"
import { createClient } from "@/lib/supabase/server"

function parseCreateBody(body: unknown) {
  if (!body || typeof body !== "object") return null

  const record = body as Record<string, unknown>
  const code = typeof record.code === "string" ? record.code.trim() : ""
  const title = typeof record.title === "string" ? record.title.trim() : ""
  const albumId = typeof record.albumId === "string" ? record.albumId.trim() : ""
  const typeId = typeof record.typeId === "string" ? record.typeId.trim() : ""
  const statusId =
    typeof record.statusId === "string" ? record.statusId.trim() : ""
  const primaryLocationId =
    typeof record.primaryLocationId === "string" && record.primaryLocationId.trim()
      ? record.primaryLocationId.trim()
      : null
  const eventDate =
    typeof record.eventDate === "string" && record.eventDate.trim()
      ? record.eventDate.trim()
      : null
  const eventEndDate =
    typeof record.eventEndDate === "string" && record.eventEndDate.trim()
      ? record.eventEndDate.trim()
      : null
  const comment = typeof record.comment === "string" ? record.comment : ""

  if (!code || !title || !albumId || !typeId) return null

  return {
    code,
    title,
    albumId,
    typeId,
    statusId,
    primaryLocationId,
    eventDate,
    eventEndDate,
    comment,
  }
}

export async function GET() {
  const session = await getAuthenticatedUser()
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 })
  }

  const supabase = await createClient()

  try {
    const projects = await listProjects(supabase)
    return NextResponse.json({ projects })
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

  const parsed = parseCreateBody(body)
  if (!parsed) {
    return NextResponse.json(
      { error: "Code, titre, album et type sont requis." },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  try {
    let statusId = parsed.statusId
    if (!statusId) {
      const draft = await getProjectStatusByCode(supabase, "draft")
      if (!draft) {
        return NextResponse.json(
          { error: "Statut Draft introuvable. Importe le seed project_statuses." },
          { status: 500 }
        )
      }
      statusId = draft.id
    }

    const project = await createProject(supabase, session.user, {
      ...parsed,
      statusId,
    })
    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: formatSupabaseError(error) },
      { status: 500 }
    )
  }
}
