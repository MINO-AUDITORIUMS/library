"use client"

import { CopyIcon, Trash2Icon } from "lucide-react"
import { useEffect, useState } from "react"

import { AlbumPickerDialog } from "@/app/programmation/_components/album-picker-dialog"
import { AlbumCover } from "@/components/catalog/album-cover"
import { DatePickerField } from "@/components/shared/date-picker-field"
import { TimePickerField } from "@/components/shared/time-picker-field"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { SESSION_STATUS_LABELS } from "@/lib/programmation/constants"
import type {
  ProgrammationAlbumRef,
  ProgrammationSession,
  SessionStatus,
} from "@/lib/programmation/types"

export type SessionDetailSheetProps = {
  session: ProgrammationSession | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (
    sessionId: string,
    patch: Partial<
      Pick<ProgrammationSession, "date" | "startTime" | "notes" | "status">
    > & { album?: ProgrammationAlbumRef }
  ) => void | Promise<void>
  onDelete: (sessionId: string) => void | Promise<void>
  onDuplicate: (sessionId: string) => void | Promise<void>
}

export function SessionDetailSheet({
  session,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
  onDuplicate,
}: SessionDetailSheetProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [notes, setNotes] = useState(session?.notes ?? "")

  useEffect(() => {
    setNotes(session?.notes ?? "")
  }, [session?.id, session?.notes])

  if (!session) return null

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Séance programmée</SheetTitle>
            <SheetDescription>
              Modifie l&apos;horaire, le statut ou remplace l&apos;album.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5 px-4">
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <AlbumCover
                title={session.album.title}
                hue={session.album.coverHue}
                imageUrl={session.album.coverImageUrl}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{session.album.title}</p>
                <p className="text-sm text-muted-foreground">
                  {session.album.artist}
                </p>
                <Badge variant="muted" className="mt-2">
                  {session.durationMinutes} min
                </Badge>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPickerOpen(true)}
              >
                Remplacer
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date</Label>
                <DatePickerField
                  id="edit-date"
                  value={session.date}
                  onChange={(date) => onUpdate(session.id, { date })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-time">Heure</Label>
                <TimePickerField
                  id="edit-time"
                  value={session.startTime}
                  onChange={(startTime) => onUpdate(session.id, { startTime })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Statut</Label>
              <Select
                value={session.status}
                onValueChange={(value) =>
                  onUpdate(session.id, { status: value as SessionStatus })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" align="start">
                  {Object.entries(SESSION_STATUS_LABELS).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                onBlur={() => {
                  if (notes !== session.notes) {
                    void onUpdate(session.id, { notes })
                  }
                }}
              />
            </div>
          </div>

          <SheetFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onDuplicate(session.id)}
            >
              <CopyIcon />
              Dupliquer
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                onDelete(session.id)
                onOpenChange(false)
              }}
            >
              <Trash2Icon />
              Retirer
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlbumPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(album) => onUpdate(session.id, { album })}
      />
    </>
  )
}
