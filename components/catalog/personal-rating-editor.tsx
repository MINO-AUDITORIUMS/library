"use client"

import { useState } from "react"
import { Loader2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { RatingSummaryCard } from "@/components/catalog/rating-summary-card"
import { StarRating } from "@/components/catalog/star-rating"
import { Button } from "@/components/ui/button"
import type { AlbumRatingsSnapshot } from "@/lib/catalog/db/album-user-ratings"

export type PersonalRatingEditorProps = {
  albumId: string
  initialRating: number | null
  className?: string
  compact?: boolean
}

export function PersonalRatingEditor({
  albumId,
  initialRating,
  className,
  compact = false,
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
    <RatingSummaryCard title="Ta note" className={className} compact={compact}>
      <div className={compact ? "space-y-2" : "space-y-3"}>
        <div className="flex flex-wrap gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Button
              key={star}
              type="button"
              variant={rating === star ? "default" : "outline"}
              size={compact ? "icon-xs" : "sm"}
              className={compact ? "min-w-7" : undefined}
              disabled={saving}
              onClick={() => onSelect(star)}
            >
              {compact ? star : `${star} ★`}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {saving ? <Loader2Icon className="size-3.5 animate-spin" /> : null}
          <StarRating value={rating} size={compact ? "sm" : "md"} />
        </div>
      </div>
    </RatingSummaryCard>
  )
}
