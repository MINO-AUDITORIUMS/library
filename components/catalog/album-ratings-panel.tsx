import { MinoTeamRating } from "@/components/catalog/mino-team-rating"
import { PersonalRatingEditor } from "@/components/catalog/personal-rating-editor"
import type { MinoRatingSummary } from "@/lib/catalog/ratings"
import { cn } from "@/lib/utils"

export type AlbumRatingsPanelProps = {
  albumId: string
  myRating: number | null
  minoRating: MinoRatingSummary
  className?: string
  compact?: boolean
}

export function AlbumRatingsPanel({
  albumId,
  myRating,
  minoRating,
  className,
  compact = false,
}: AlbumRatingsPanelProps) {
  return (
    <div
      className={cn(
        "grid h-full auto-rows-fr gap-3 sm:grid-cols-2",
        className
      )}
    >
      <PersonalRatingEditor
        key={`${albumId}-${myRating ?? "none"}`}
        albumId={albumId}
        initialRating={myRating}
        compact={compact}
      />
      <MinoTeamRating rating={minoRating} compact={compact} />
    </div>
  )
}
