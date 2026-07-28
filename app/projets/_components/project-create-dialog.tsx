"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"

import { AlbumPickerDialog } from "@/app/programmation/_components/album-picker-dialog"
import { AlbumCover } from "@/components/catalog/album-cover"
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
import type { ProgrammationAlbumRef } from "@/lib/programmation/types"
import type {
  ProjectCreateInput,
  ProjectStatus,
  ProjectType,
} from "@/lib/projects/types"

export type ProjectLocationOption = {
  id: string
  name: string
  city: string
}

export type ProjectCreateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  types: ProjectType[]
  statuses: ProjectStatus[]
  locations: ProjectLocationOption[]
  onCreate: (input: ProjectCreateInput) => Promise<unknown>
}

const NONE_LOCATION = "__none__"

export function ProjectCreateDialog({
  open,
  onOpenChange,
  types,
  statuses,
  locations,
  onCreate,
}: ProjectCreateDialogProps) {
  const draftStatusId =
    statuses.find((s) => s.code === "draft")?.id ?? statuses[0]?.id ?? ""
  const defaultTypeId = types[0]?.id ?? ""

  const [album, setAlbum] = useState<ProgrammationAlbumRef | null>(null)
  const [albumPickerOpen, setAlbumPickerOpen] = useState(false)
  const [code, setCode] = useState("")
  const [title, setTitle] = useState("")
  const [typeId, setTypeId] = useState(defaultTypeId)
  const [statusId, setStatusId] = useState(draftStatusId)
  const [locationId, setLocationId] = useState(NONE_LOCATION)
  const [eventDate, setEventDate] = useState("")
  const [eventEndDate, setEventEndDate] = useState("")
  const [comment, setComment] = useState("")
  const [saving, setSaving] = useState(false)

  const canCreate = useMemo(() => {
    return Boolean(
      album && code.trim() && title.trim() && (typeId || defaultTypeId)
    )
  }, [album, code, defaultTypeId, title, typeId])

  const reset = () => {
    setAlbum(null)
    setAlbumPickerOpen(false)
    setCode("")
    setTitle("")
    setTypeId(defaultTypeId)
    setStatusId(draftStatusId)
    setLocationId(NONE_LOCATION)
    setEventDate("")
    setEventEndDate("")
    setComment("")
    setSaving(false)
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          onOpenChange(next)
          if (!next) reset()
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouveau projet</DialogTitle>
            <DialogDescription>
              Lie un album du catalogue, choisis un type et un code projet.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>Album</Label>
              {album ? (
                <div className="flex items-center gap-3 rounded-lg border px-3 py-2">
                  <AlbumCover
                    title={album.title}
                    hue={album.coverHue}
                    imageUrl={album.coverImageUrl}
                    size="sm"
                    className="size-10 rounded-md"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {album.title}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {album.artist}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAlbumPickerOpen(true)}
                  >
                    Changer
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setAlbumPickerOpen(true)}
                >
                  Choisir un album
                </Button>
              )}
            </div>

            <div className="grid gap-1.5 sm:grid-cols-2 sm:gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="project-code">Code projet</Label>
                <Input
                  id="project-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Ex: AYAL"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="project-title">Titre</Label>
                <Input
                  id="project-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titre de l’événement"
                />
              </div>
            </div>

            <div className="grid gap-1.5 sm:grid-cols-2 sm:gap-3">
              <div className="grid gap-1.5">
                <Label>Type</Label>
                <Select value={typeId || defaultTypeId} onValueChange={setTypeId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Type" />
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
                <Select
                  value={statusId || draftStatusId}
                  onValueChange={setStatusId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Statut" />
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
                  <SelectValue placeholder="Lieu (optionnel)" />
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
                <Label htmlFor="project-event-date">Date début</Label>
                <Input
                  id="project-event-date"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="project-event-end">Date fin</Label>
                <Input
                  id="project-event-end"
                  type="date"
                  value={eventEndDate}
                  onChange={(e) => setEventEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="project-comment">Commentaire</Label>
              <Textarea
                id="project-comment"
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
              disabled={!canCreate || saving}
              onClick={() => {
                if (!album) return
                void (async () => {
                  setSaving(true)
                  try {
                    await onCreate({
                      code: code.trim(),
                      title: title.trim(),
                      albumId: album.albumId,
                      typeId: typeId || defaultTypeId,
                      statusId: statusId || draftStatusId,
                      primaryLocationId:
                        locationId === NONE_LOCATION ? null : locationId,
                      eventDate: eventDate || null,
                      eventEndDate: eventEndDate || null,
                      comment,
                    })
                    onOpenChange(false)
                    reset()
                  } catch (error) {
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "Impossible de créer le projet."
                    )
                    setSaving(false)
                  }
                })()
              }}
            >
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlbumPickerDialog
        open={albumPickerOpen}
        onOpenChange={setAlbumPickerOpen}
        description="Sélectionne l’album lié à ce projet."
        onSelect={(selected) => {
          setAlbum(selected)
          if (!title.trim()) setTitle(selected.title)
        }}
      />
    </>
  )
}
