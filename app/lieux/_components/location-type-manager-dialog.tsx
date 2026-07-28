"use client"

import { useMemo, useState } from "react"
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
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
import type { LocationType } from "@/lib/locations/types"

export type LocationTypeManagerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  types: LocationType[]
  usageCountByTypeId?: Record<string, number>
  onAddType: (label: string) => Promise<string | null>
  onRenameType: (id: string, label: string) => void | Promise<void>
  onDeleteType: (id: string) => void | Promise<void>
}

type PendingDelete = { id: string; label: string } | null

export function LocationTypeManagerDialog({
  open,
  onOpenChange,
  types,
  usageCountByTypeId,
  onAddType,
  onRenameType,
  onDeleteType,
}: LocationTypeManagerDialogProps) {
  const [newLabel, setNewLabel] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingLabel, setEditingLabel] = useState("")
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null)
  const [busy, setBusy] = useState(false)

  const sorted = useMemo(() => {
    return [...types].sort((a, b) => a.label.localeCompare(b.label, "fr"))
  }, [types])

  const startEdit = (t: LocationType) => {
    setEditingId(t.id)
    setEditingLabel(t.label)
  }

  const stopEdit = () => {
    setEditingId(null)
    setEditingLabel("")
  }

  const commitEdit = async () => {
    if (!editingId) return
    const next = editingLabel.trim()
    if (!next) return
    setBusy(true)
    try {
      await onRenameType(editingId, next)
      stopEdit()
    } finally {
      setBusy(false)
    }
  }

  const handleAdd = async () => {
    const trimmed = newLabel.trim()
    if (!trimmed) return
    setBusy(true)
    try {
      const id = await onAddType(trimmed)
      if (id) setNewLabel("")
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Gérer les types de lieux</DialogTitle>
            <DialogDescription>
              Ces types sont stockés en base et peuvent évoluer dans le temps.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Nouveau type</Label>
              <div className="flex gap-2">
                <Input
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Ex: Rooftop, Galerie, Studio…"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleAdd()
                  }}
                />
                <Button
                  variant="secondary"
                  disabled={busy}
                  onClick={() => void handleAdd()}
                >
                  <PlusIcon className="mr-1 h-4 w-4" />
                  Ajouter
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Types existants</Label>
              <div className="max-h-64 overflow-auto rounded-lg border">
                <div className="grid gap-1 p-1">
                  {sorted.map((t) => {
                    const usage = usageCountByTypeId?.[t.id] ?? 0
                    const isEditing = editingId === t.id
                    const canDelete = usage === 0

                    return (
                      <div
                        key={t.id}
                        className="flex items-center justify-between gap-2 rounded-md px-2 py-2 hover:bg-muted/60"
                      >
                        <div className="min-w-0 flex-1">
                          {isEditing ? (
                            <div className="flex gap-2">
                              <Input
                                value={editingLabel}
                                onChange={(e) => setEditingLabel(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") void commitEdit()
                                  if (e.key === "Escape") stopEdit()
                                }}
                              />
                              <Button
                                variant="secondary"
                                disabled={busy}
                                onClick={() => void commitEdit()}
                              >
                                OK
                              </Button>
                              <Button variant="outline" onClick={stopEdit}>
                                Annuler
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="truncate text-sm font-medium">
                                {t.label}
                              </div>
                              <Badge variant="outline" className="shrink-0">
                                {t.code}
                              </Badge>
                            </div>
                          )}
                        </div>

                        {!isEditing ? (
                          <div className="flex items-center gap-2">
                            {usageCountByTypeId ? (
                              <Badge variant={usage ? "muted" : "outline"}>
                                {usage} lieu{usage > 1 ? "x" : ""}
                              </Badge>
                            ) : null}
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => startEdit(t)}
                              aria-label="Renommer"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() =>
                                setPendingDelete({ id: t.id, label: t.label })
                              }
                              disabled={!canDelete}
                              aria-label="Supprimer"
                            >
                              <Trash2Icon className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </div>

              {usageCountByTypeId ? (
                <div className="text-xs text-muted-foreground">
                  La suppression est désactivée si un type est utilisé par un
                  lieu.
                </div>
              ) : null}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {pendingDelete ? (
        <AlertDialog
          open={!!pendingDelete}
          onOpenChange={(next) => {
            if (!next) setPendingDelete(null)
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer ce type ?</AlertDialogTitle>
              <AlertDialogDescription>
                Le type <span className="font-medium">{pendingDelete.label}</span>{" "}
                sera supprimé. Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  void (async () => {
                    try {
                      await onDeleteType(pendingDelete.id)
                      setPendingDelete(null)
                    } catch {
                      setPendingDelete(null)
                    }
                  })()
                }}
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </>
  )
}
