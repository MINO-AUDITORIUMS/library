"use client"

import { Loader2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

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

export type TrackAddClipDialogProps = {
  albumId: string
  position: number
  trackTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TrackAddClipDialog({
  albumId,
  position,
  trackTitle,
  open,
  onOpenChange,
}: TrackAddClipDialogProps) {
  const router = useRouter()
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [saving, setSaving] = useState(false)

  async function onSave() {
    setSaving(true)
    try {
      const response = await fetch(
        `/api/albums/${albumId}/tracks/${position}/video`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ youtubeUrl }),
        }
      )
      const data = (await response.json()) as { error?: string }

      if (!response.ok) {
        toast.error(data.error ?? "Impossible d'ajouter le clip.")
        return
      }

      toast.success("Clip ajouté.")
      onOpenChange(false)
      setYoutubeUrl("")
      router.refresh()
    } catch {
      toast.error("Erreur réseau lors de l'enregistrement.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) setYoutubeUrl("")
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un clip</DialogTitle>
          <DialogDescription>
            Titre de la piste : <strong>{trackTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        <div>
          <Label htmlFor={`track-clip-${position}`}>Lien YouTube</Label>
          <Input
            id={`track-clip-${position}`}
            value={youtubeUrl}
            onChange={(event) => setYoutubeUrl(event.target.value)}
            placeholder="https://www.youtube.com/watch?v=…"
            disabled={saving}
            autoComplete="off"
            onKeyDown={(event) => {
              if (event.key !== "Enter" || saving) return
              event.preventDefault()
              void onSave()
            }}
            className="mt-1"
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => onOpenChange(false)}
          >
            Annuler
          </Button>
          <Button
            type="button"
            disabled={saving || youtubeUrl.trim().length === 0}
            onClick={() => void onSave()}
          >
            {saving ? <Loader2Icon className="animate-spin" /> : null}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
