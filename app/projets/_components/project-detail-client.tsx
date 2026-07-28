"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeftIcon,
  CalendarIcon,
  MapPinIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react"
import { toast } from "sonner"

import { ProjectDeleteAlert } from "@/app/projets/_components/project-delete-alert"
import { ProjectEditDialog } from "@/app/projets/_components/project-edit-dialog"
import type { ProjectLocationOption } from "@/app/projets/_components/project-create-dialog"
import { AlbumCover } from "@/components/catalog/album-cover"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatProjectDateRange } from "@/lib/projects/format-date"
import type {
  Project,
  ProjectStatus,
  ProjectType,
} from "@/lib/projects/types"
import { albumDetailRoute, routes } from "@/lib/routes"

export type ProjectDetailClientProps = {
  initialProject: Project
  types: ProjectType[]
  statuses: ProjectStatus[]
  locations: ProjectLocationOption[]
}

export function ProjectDetailClient({
  initialProject,
  types,
  statuses,
  locations,
}: ProjectDetailClientProps) {
  const router = useRouter()
  const [project, setProject] = useState(initialProject)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const dateLabel = formatProjectDateRange(
    project.eventDate,
    project.eventEndDate
  )

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={routes.projects}>
            <ArrowLeftIcon className="mr-1 h-4 w-4" />
            Retour
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
            <PencilIcon className="mr-1 h-4 w-4" />
            Modifier
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2Icon className="mr-1 h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-start gap-4">
            <AlbumCover
              title={project.album.title}
              hue={project.album.coverHue}
              imageUrl={project.album.coverImageUrl}
              size="sm"
              className="size-20 rounded-lg"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{project.code}</Badge>
                <Badge variant="secondary">{project.type.label}</Badge>
                <Badge>{project.status.label}</Badge>
              </div>
              <CardTitle className="mt-2 text-2xl">{project.title}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                <Link
                  href={albumDetailRoute(project.album.id)}
                  className="underline-offset-4 hover:underline"
                >
                  {project.album.title}
                </Link>
                {" · "}
                {project.album.artist}
              </p>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="grid gap-3 pt-4 text-sm">
          {dateLabel ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              {dateLabel}
            </div>
          ) : (
            <div className="text-muted-foreground">Aucune date renseignée</div>
          )}
          {project.location ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPinIcon className="h-4 w-4" />
              {project.location.name}
              {project.location.city ? ` · ${project.location.city}` : ""}
            </div>
          ) : (
            <div className="text-muted-foreground">Aucun lieu principal</div>
          )}
          {project.comment ? (
            <div className="rounded-lg border bg-muted/30 px-3 py-2 whitespace-pre-wrap">
              {project.comment}
            </div>
          ) : null}
          <div className="pt-2 text-xs text-muted-foreground">
            Budgets, billetterie et P&L arriveront dans une prochaine itération.
          </div>
        </CardContent>
      </Card>

      <ProjectEditDialog
        key={`${project.id}-${editOpen ? "open" : "closed"}`}
        open={editOpen}
        onOpenChange={setEditOpen}
        project={project}
        types={types}
        statuses={statuses}
        locations={locations}
        onSave={async (patch) => {
          const response = await fetch(`/api/projects/${project.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patch),
          })
          if (!response.ok) {
            const body = (await response.json().catch(() => null)) as {
              error?: string
            } | null
            throw new Error(body?.error ?? "Impossible de modifier le projet.")
          }
          const body = (await response.json()) as { project: Project }
          setProject(body.project)
          toast.success("Projet mis à jour.")
          router.refresh()
        }}
      />

      <ProjectDeleteAlert
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        project={project}
        onConfirm={async () => {
          const response = await fetch(`/api/projects/${project.id}`, {
            method: "DELETE",
          })
          if (!response.ok) {
            const body = (await response.json().catch(() => null)) as {
              error?: string
            } | null
            throw new Error(body?.error ?? "Impossible de supprimer le projet.")
          }
          toast.success("Projet supprimé.")
          router.push(routes.projects)
          router.refresh()
        }}
      />
    </div>
  )
}
