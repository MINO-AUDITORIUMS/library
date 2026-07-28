"use client"

import { useState } from "react"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { ProjectCard } from "@/app/projets/_components/project-card"
import {
  ProjectCreateDialog,
  type ProjectLocationOption,
} from "@/app/projets/_components/project-create-dialog"
import { Button } from "@/components/ui/button"
import { useProjects } from "@/hooks/use-projects"
import type {
  Project,
  ProjectStatus,
  ProjectType,
} from "@/lib/projects/types"

export type ProjectsPageClientProps = {
  initialProjects: Project[]
  types: ProjectType[]
  statuses: ProjectStatus[]
  locations: ProjectLocationOption[]
}

export function ProjectsPageClient({
  initialProjects,
  types,
  statuses,
  locations,
}: ProjectsPageClientProps) {
  const { projects, createProject } = useProjects({ initialProjects })
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button onClick={() => setCreateOpen(true)}>
          <PlusIcon className="mr-1 h-4 w-4" />
          Nouveau projet
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed px-6 py-16 text-center">
          <p className="text-sm font-medium">Aucun projet pour l’instant</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Crée un premier projet lié à un album du catalogue.
          </p>
          <Button className="mt-4" onClick={() => setCreateOpen(true)}>
            Nouveau projet
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <ProjectCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        types={types}
        statuses={statuses}
        locations={locations}
        onCreate={async (input) => {
          try {
            await createProject(input)
            toast.success("Projet créé.")
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : "Impossible de créer le projet."
            )
            throw error
          }
        }}
      />
    </div>
  )
}
