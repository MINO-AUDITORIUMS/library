"use client"

import { useEffect, useState } from "react"

import { AlbumCover } from "@/components/catalog/album-cover"
import { AlbumPickerDialog } from "@/app/programmation/_components/album-picker-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DatePickerField } from "@/components/shared/date-picker-field"
import { TimePickerField } from "@/components/shared/time-picker-field"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { SESSION_STATUS_LABELS } from "@/lib/programmation/constants"
import type {
  ProgrammationAlbumRef,
  SessionDraft,
  SessionStatus,
} from "@/lib/programmation/types"

export type SessionFormDialogProps = {
  open: boolean
  draft: SessionDraft
  submitting?: boolean
  onOpenChange: (open: boolean) => void
  onDraftChange: (draft: SessionDraft) => void
  onSubmit: () => void
}

export function SessionFormDialog({
  open,
  draft,
  submitting = false,
  onOpenChange,
  onDraftChange,
  onSubmit,
}: SessionFormDialogProps) {
  const [pickerOpen, setPickerOpen] = useState(false)

  useEffect(() => {
    if (!open) setPickerOpen(false)
  }, [open])

  function updateDraft(patch: Partial<SessionDraft>) {
    onDraftChange({ ...draft, ...patch })
  }

  function handleAlbumSelect(album: ProgrammationAlbumRef) {
    updateDraft({ album })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Programmer une séance</DialogTitle>
            <DialogDescription>
              La durée du bloc est calculée automatiquement depuis l&apos;album.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Album</Label>
              {draft.album ? (
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <AlbumCover
                    title={draft.album.title}
                    hue={draft.album.coverHue}
                    imageUrl={draft.album.coverImageUrl}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{draft.album.title}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {draft.album.artist} · {draft.album.durationMinutes} min
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPickerOpen(true)}
                  >
                    Changer
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setPickerOpen(true)}
                >
                  Choisir un album
                </Button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="session-date">Date</Label>
                <DatePickerField
                  id="session-date"
                  value={draft.date}
                  onChange={(date) => updateDraft({ date })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="session-time">Heure de début</Label>
                <TimePickerField
                  id="session-time"
                  value={draft.startTime}
                  onChange={(startTime) => updateDraft({ startTime })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Statut</Label>
              <Select
                value={draft.status}
                onValueChange={(value) =>
                  updateDraft({ status: value as SessionStatus })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SESSION_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="session-notes">Notes</Label>
              <Textarea
                id="session-notes"
                value={draft.notes}
                onChange={(event) => updateDraft({ notes: event.target.value })}
                placeholder="Contexte de la séance, salle, public…"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="button" disabled={!draft.album || submitting} onClick={onSubmit}>
              {submitting ? "Ajout…" : "Ajouter au planning"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlbumPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleAlbumSelect}
      />
    </>
  )
}
