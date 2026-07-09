"use client"

import type { Location } from "@/app/lieux/_components/mock-locations"
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

export type LocationDeleteAlertProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  location: Location
  onConfirm: () => void
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
            Le lieu <span className="font-medium">{location.name}</span> sera
            supprimé (mock). Cette action est irréversible.
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
                onConfirm()
                onOpenChange(false)
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

