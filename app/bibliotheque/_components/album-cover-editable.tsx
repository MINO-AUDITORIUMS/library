"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ImageIcon, Loader2Icon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { AlbumCover } from "@/components/catalog/album-cover"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  ALBUM_COVER_MAX_BYTES,
  ALBUM_COVER_MIME_TYPES,
} from "@/lib/catalog/storage/album-cover"
import { cn } from "@/lib/utils"

export type AlbumCoverEditableProps = {
  albumId: string
  title: string
  coverHue: number
  coverImageUrl: string | null
  className?: string
}

export function AlbumCoverEditable({
  albumId,
  title,
  coverHue,
  coverImageUrl,
  className,
}: AlbumCoverEditableProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [removing, setRemoving] = useState(false)
  const busy = uploading || removing

  async function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    if (!ALBUM_COVER_MIME_TYPES.includes(file.type as never)) {
      toast.error("Format non supporté (JPEG, PNG, WebP ou GIF).")
      return
    }
    if (file.size > ALBUM_COVER_MAX_BYTES) {
      toast.error("L'image dépasse la taille maximale de 10 Mo.")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const response = await fetch(`/api/albums/${albumId}/cover`, {
        method: "PUT",
        body: formData,
      })
      const data = (await response.json()) as { error?: string }

      if (!response.ok) {
        toast.error(data.error ?? "Impossible de mettre à jour la pochette.")
        return
      }

      toast.success("Pochette mise à jour.")
      router.refresh()
    } catch {
      toast.error("Erreur réseau lors de l'envoi.")
    } finally {
      setUploading(false)
    }
  }

  async function onRemove() {
    setRemoving(true)
    try {
      const response = await fetch(`/api/albums/${albumId}/cover`, {
        method: "DELETE",
      })
      const data = (await response.json()) as { error?: string }

      if (!response.ok) {
        toast.error(data.error ?? "Impossible de supprimer la pochette.")
        return
      }

      toast.success("Pochette supprimée.")
      router.refresh()
    } catch {
      toast.error("Erreur réseau lors de la suppression.")
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div className={cn("group relative shrink-0", className)}>
      <AlbumCover
        title={title}
        hue={coverHue}
        imageUrl={coverImageUrl}
        size="lg"
        className="size-full max-w-none"
      />

      <input
        ref={inputRef}
        type="file"
        accept={ALBUM_COVER_MIME_TYPES.join(",")}
        className="hidden"
        onChange={onPick}
      />

      {coverImageUrl ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              aria-label="Supprimer la pochette"
              disabled={busy}
              className="absolute top-1.5 right-1.5 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
            >
              <Trash2Icon className="text-destructive" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer la pochette ?</AlertDialogTitle>
              <AlertDialogDescription>
                La pochette actuelle de « {title} » sera définitivement
                supprimée.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={onRemove}
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="absolute right-1.5 bottom-1.5 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {uploading ? (
          <Loader2Icon className="animate-spin" />
        ) : (
          <ImageIcon />
        )}
        Cover
      </Button>
    </div>
  )
}
