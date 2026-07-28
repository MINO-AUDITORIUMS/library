"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"

import type { ProjectLocationOption } from "@/app/projets/_components/project-create-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type {
  Project,
  ProjectStatus,
  ProjectType,
  ProjectUpdateInput,
} from "@/lib/projects/types"

export type ProjectEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project
  types: ProjectType[]
  statuses: ProjectStatus[]
  locations: ProjectLocationOption[]
  onSave: (patch: ProjectUpdateInput) => Promise<void>
}

const NONE_LOCATION = "__none__"

export function ProjectEditDialog({
  open,
  onOpenChange,
  project,
  types,
  statuses,
  locations,
  onSave,
}: ProjectEditDialogProps) {
  const [code, setCode] = useState(project.code)
  const [title, setTitle] = useState(project.title)
  const [typeId, setTypeId] = useState(project.type.id)
  const [statusId, setStatusId] = useState(project.status.id)
  const [locationId, setLocationId] = useState(
    project.location?.id ?? NONE_LOCATION
  )
  const [eventDate, setEventDate] = useState(project.eventDate ?? "")
  const [eventEndDate, setEventEndDate] = useState(project.eventEndDate ?? "")
  const [comment, setComment] = useState(project.comment)
  const [saving, setSaving] = useState(false)

  const canSave = useMemo(() => {
    return Boolean(code.trim() && title.trim() && typeId && statusId)
  }, [code, statusId, title, typeId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifier le projet</DialogTitle>
          <DialogDescription>
            Album : {project.album.title} · {project.album.artist}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1.5 sm:grid-cols-2 sm:gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="edit-project-code">Code projet</Label>
              <Input
                id="edit-project-code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-project-title">Titre</Label>
              <Input
                id="edit-project-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-1.5 sm:grid-cols-2 sm:gap-3">
            <div className="grid gap-1.5">
              <Label>Type</Label>
              <Select value={typeId} onValueChange={setTypeId}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" align="start">
                  {types.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Statut</Label>
              <Select value={statusId} onValueChange={setStatusId}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" align="start">
                  {statuses.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label>Lieu principal</Label>
            <Select value={locationId} onValueChange={setLocationId}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="start">
                <SelectItem value={NONE_LOCATION}>Aucun</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                    {location.city ? ` · ${location.city}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5 sm:grid-cols-2 sm:gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="edit-event-date">Date début</Label>
              <Input
                id="edit-event-date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-event-end">Date fin</Label>
              <Input
                id="edit-event-end"
                type="date"
                value={eventEndDate}
                onChange={(e) => setEventEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="edit-comment">Commentaire</Label>
            <Textarea
              id="edit-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            disabled={!canSave || saving}
            onClick={() => {
              void (async () => {
                setSaving(true)
                try {
                  await onSave({
                    code: code.trim(),
                    title: title.trim(),
                    typeId,
                    statusId,
                    primaryLocationId:
                      locationId === NONE_LOCATION ? null : locationId,
                    eventDate: eventDate || null,
                    eventEndDate: eventEndDate || null,
                    comment,
                  })
                  onOpenChange(false)
                } catch (error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : "Impossible de modifier le projet."
                  )
                  setSaving(false)
                }
              })()
            }}
          >
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
