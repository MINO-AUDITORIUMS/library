import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ProjectDetailClient } from "@/app/projets/_components/project-detail-client"
import { listLocations } from "@/lib/locations/db/locations"
import { listProjectStatuses } from "@/lib/projects/db/project-statuses"
import { listProjectTypes } from "@/lib/projects/db/project-types"
import { getProjectById } from "@/lib/projects/db/projects"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Projet",
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const [project, types, statuses, locations] = await Promise.all([
    getProjectById(supabase, id),
    listProjectTypes(supabase),
    listProjectStatuses(supabase),
    listLocations(supabase),
  ])

  if (!project) notFound()

  return (
    <ProjectDetailClient
      initialProject={project}
      types={types}
      statuses={statuses}
      locations={locations.map((location) => ({
        id: location.id,
        name: location.name,
        city: location.city,
      }))}
    />
  )
}
