import type { Metadata } from "next"

import { ProjectsPageClient } from "@/app/projets/_components/projects-page-client"
import { Badge } from "@/components/ui/badge"
import { listLocations } from "@/lib/locations/db/locations"
import { listProjectStatuses } from "@/lib/projects/db/project-statuses"
import { listProjectTypes } from "@/lib/projects/db/project-types"
import { listProjects } from "@/lib/projects/db/projects"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Projets",
}

export default async function ProjectsPage() {
  const supabase = await createClient()
  const [projects, types, statuses, locations] = await Promise.all([
    listProjects(supabase),
    listProjectTypes(supabase),
    listProjectStatuses(supabase),
    listLocations(supabase),
  ])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Projets</h1>
            <Badge variant="outline">WIP</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Socle Workspace — albums, types TD/MPE/BPE, lieux et statuts.
          </p>
        </div>
      </header>

      <ProjectsPageClient
        initialProjects={projects}
        types={types}
        statuses={statuses}
        locations={locations.map((location) => ({
          id: location.id,
          name: location.name,
          city: location.city,
        }))}
      />
    </div>
  )
}
