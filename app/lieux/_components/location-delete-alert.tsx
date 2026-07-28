"use client"

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
import { Button } from "@/components/ui/button"
import type { Location } from "@/lib/locations/types"

export type LocationDeleteAlertProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  location: Location
  onConfirm: () => void | Promise<void>
}

export function LocationDeleteAlert({
  open,
  onOpenChange,
  location,
  onConfirm,
}: LocationDeleteAlertProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer le lieu ?</AlertDialogTitle>
          <AlertDialogDescription>
            Le lieu <span className="font-medium">{location.name}</span> et ses
            salles seront supprimés. Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Annuler</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              onClick={() => {
                void (async () => {
                  await onConfirm()
                  onOpenChange(false)
                })()
              }}
            >
              Supprimer
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
