"use client"

import { useState } from "react"
import { Loader2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { StarRating } from "@/components/catalog/star-rating"
import { Button } from "@/components/ui/button"
import type { AlbumRatingsSnapshot } from "@/lib/catalog/db/album-user-ratings"
import { cn } from "@/lib/utils"

export type PersonalRatingEditorProps = {
  albumId: string
  initialRating: number | null
  className?: string
}

export function PersonalRatingEditor({
  albumId,
  initialRating,
  className,
}: PersonalRatingEditorProps) {
  const router = useRouter()
  const [rating, setRating] = useState(initialRating)
  const [saving, setSaving] = useState(false)

  async function saveRating(next: number | null) {
    setSaving(true)

    try {
      const response = await fetch(`/api/albums/${albumId}/rating`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: next }),
      })
      const data = (await response.json()) as AlbumRatingsSnapshot & {
        error?: string
      }

      if (!response.ok) {
        toast.error(data.error ?? "Impossible d'enregistrer ta note.")
        return
      }

      setRating(data.myRating)
      toast.success(next === null ? "Note retirée." : "Note enregistrée.")
      router.refresh()
    } catch {
      toast.error("Erreur réseau.")
    } finally {
      setSaving(false)
    }
  }

  function onSelect(star: number) {
    if (saving) return
    const next = rating === star ? null : star
    void saveRating(next)
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-border/70 bg-muted/10 px-4 py-3",
        className
      )}
    >
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Ta note
      </p>

      <div className="mt-2 space-y-3">
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Button
              key={star}
              type="button"
              variant={rating === star ? "default" : "outline"}
              size="sm"
              disabled={saving}
              onClick={() => onSelect(star)}
            >
              {star} ★
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {saving ? <Loader2Icon className="size-4 animate-spin" /> : null}
          <StarRating value={rating} size="md" />
        </div>
      </div>
    </div>
  )
}
