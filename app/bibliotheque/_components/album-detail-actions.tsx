"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2Icon, PencilIcon, RefreshCwIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { albumEditRoute, routes } from "@/lib/routes"

export type AlbumDetailActionsProps = {
  albumId: string
  albumTitle: string
  canSyncTracks: boolean
}

type SyncTracksResponse = {
  trackCount?: number
  tracksWithWriters?: number
  tracksWithProducers?: number
  tracksWithVideos?: number
  error?: string
}

export function AlbumDetailActions({
  albumId,
  albumTitle,
  canSyncTracks,
}: AlbumDetailActionsProps) {
  const router = useRouter()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [syncing, setSyncing] = useState(false)

  async function onSyncTracks() {
    setSyncing(true)

    try {
      const response = await fetch(`/api/albums/${albumId}/sync-tracks`, {
        method: "POST",
      })
      const data = (await response.json()) as SyncTracksResponse

      if (!response.ok) {
        toast.error(data.error ?? "Impossible de resynchroniser la tracklist.")
        return
      }

      const writers = data.tracksWithWriters ?? 0
      const producers = data.tracksWithProducers ?? 0
      const videos = data.tracksWithVideos ?? 0
      const videoLabel =
        videos > 0
          ? `, ${videos} vidéo${videos > 1 ? "s" : ""} YouTube`
          : ""
      toast.success(
        `Tracklist mise à jour (${data.trackCount ?? 0} pistes, ${writers} avec écriture, ${producers} avec production${videoLabel}).`
      )
      router.refresh()
    } catch {
      toast.error("Erreur réseau lors de la resynchronisation.")
    } finally {
      setSyncing(false)
    }
  }

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
      {canSyncTracks ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={syncing || deleting}
          onClick={onSyncTracks}
        >
          {syncing ? <Loader2Icon className="animate-spin" /> : <RefreshCwIcon />}
          Resynchroniser
        </Button>
      ) : null}

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
            disabled={deleting || syncing}
            onClick={onDelete}
          >
            {deleting ? <Loader2Icon className="animate-spin" /> : null}
            Confirmer
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={deleting || syncing}
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
          disabled={syncing}
          onClick={() => setConfirmingDelete(true)}
        >
          <Trash2Icon />
          Supprimer
        </Button>
      )}
    </div>
  )
}
