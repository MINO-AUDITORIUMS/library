"use client"

import { toast } from "sonner"

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
import type { Project } from "@/lib/projects/types"

export type ProjectDeleteAlertProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project
  onConfirm: () => Promise<void>
}

export function ProjectDeleteAlert({
  open,
  onOpenChange,
  project,
  onConfirm,
}: ProjectDeleteAlertProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer le projet ?</AlertDialogTitle>
          <AlertDialogDescription>
            Le projet <span className="font-medium">{project.title}</span> (
            {project.code}) sera définitivement supprimé.
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
                  try {
                    await onConfirm()
                    onOpenChange(false)
                  } catch (error) {
                    toast.error(
                      error instanceof Error
                        ? error.message
                        : "Impossible de supprimer le projet."
                    )
                  }
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
