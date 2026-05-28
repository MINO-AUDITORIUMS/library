import { DiscogsCommunityRating } from "@/components/catalog/discogs-community-rating"
import { StarRating } from "@/components/catalog/star-rating"
import type { DiscogsCommunityStats } from "@/lib/catalog/discogs/types"
import { cn } from "@/lib/utils"

export type AlbumRatingsPanelProps = {
  personalRating: number | null
  discogsCommunity: DiscogsCommunityStats | null
  className?: string
}

export function AlbumRatingsPanel({
  personalRating,
  discogsCommunity,
  className,
}: AlbumRatingsPanelProps) {
  return (
    <div
      className={cn(
        "grid gap-3 sm:grid-cols-2",
        !discogsCommunity && "sm:grid-cols-1",
        className
      )}
    >
      <div className="rounded-lg border border-border/70 bg-muted/10 px-4 py-3">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Ta note
        </p>
        <div className="mt-2">
          <StarRating value={personalRating} size="md" />
        </div>
      </div>

      {discogsCommunity ? (
        <DiscogsCommunityRating stats={discogsCommunity} />
      ) : null}
    </div>
  )
}
