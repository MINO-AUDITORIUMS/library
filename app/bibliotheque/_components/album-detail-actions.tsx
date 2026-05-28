"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2Icon, PencilIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { albumEditRoute, routes } from "@/lib/routes"

export type AlbumDetailActionsProps = {
  albumId: string
  albumTitle: string
}

export function AlbumDetailActions({
  albumId,
  albumTitle,
}: AlbumDetailActionsProps) {
  const router = useRouter()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function onDelete() {
    setDeleting(true)

    try {
      const response = await fetch(`/api/albums/${albumId}`, {
        method: "DELETE",
      })
      const data = (await response.json()) as { error?: string }

      if (!response.ok) {
        toast.error(data.error ?? "Impossible de supprimer l'album.")
        return
      }

      toast.success("Album supprimé.")
      router.push(routes.bibliotheque)
      router.refresh()
    } catch {
      toast.error("Erreur réseau lors de la suppression.")
    } finally {
      setDeleting(false)
      setConfirmingDelete(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" asChild>
        <Link href={albumEditRoute(albumId)}>
          <PencilIcon />
          Modifier
        </Link>
      </Button>

      {confirmingDelete ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Supprimer « {albumTitle} » ?
          </span>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={deleting}
            onClick={onDelete}
          >
            {deleting ? <Loader2Icon className="animate-spin" /> : null}
            Confirmer
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={deleting}
            onClick={() => setConfirmingDelete(false)}
          >
            Annuler
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => setConfirmingDelete(true)}
        >
          <Trash2Icon />
          Supprimer
        </Button>
      )}
    </div>
  )
}
