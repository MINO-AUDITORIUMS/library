"use client"

import Link from "next/link"
import { CalendarIcon, MapPinIcon } from "lucide-react"

import { AlbumCover } from "@/components/catalog/album-cover"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { formatProjectDateRange } from "@/lib/projects/format-date"
import type { Project } from "@/lib/projects/types"
import { projectDetailRoute } from "@/lib/routes"

export type ProjectCardProps = {
  project: Project
}

function statusTone(code: string) {
  switch (code) {
    case "in_progress":
      return "default" as const
    case "completed":
      return "secondary" as const
    case "archived":
      return "outline" as const
    default:
      return "muted" as const
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  const dateLabel = formatProjectDateRange(
    project.eventDate,
    project.eventEndDate
  )

  return (
    <Link href={projectDetailRoute(project.id)} className="block h-full">
      <Card className="h-full transition-colors hover:bg-muted/40">
        <CardHeader className="flex flex-row items-start gap-3 space-y-0">
          <AlbumCover
            title={project.album.title}
            hue={project.album.coverHue}
            imageUrl={project.album.coverImageUrl}
            size="sm"
            className="size-14 rounded-md"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{project.code}</Badge>
              <Badge variant="secondary">{project.type.label}</Badge>
              <Badge variant={statusTone(project.status.code)}>
                {project.status.label}
              </Badge>
            </div>
            <h2 className="mt-2 truncate text-base font-semibold">
              {project.title}
            </h2>
            <p className="truncate text-sm text-muted-foreground">
              {project.album.artist}
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-1.5 text-sm text-muted-foreground">
          {dateLabel ? (
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{dateLabel}</span>
            </div>
          ) : null}
          {project.location ? (
            <div className="flex items-center gap-1.5">
              <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                {project.location.name}
                {project.location.city ? ` · ${project.location.city}` : ""}
              </span>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  )
}
