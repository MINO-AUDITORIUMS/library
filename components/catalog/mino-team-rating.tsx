import { FractionalStars } from "@/components/catalog/fractional-stars"
import { RatingSummaryCard } from "@/components/catalog/rating-summary-card"
import type { MinoRatingSummary } from "@/lib/catalog/ratings"
import { cn } from "@/lib/utils"

export type MinoTeamRatingProps = {
  rating: MinoRatingSummary
  className?: string
  compact?: boolean
}

function formatCount(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value)
}

function formatAverage(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)
}

export function MinoTeamRating({
  rating,
  className,
  compact = false,
}: MinoTeamRatingProps) {
  const hasRating = rating.count > 0 && rating.average != null

  return (
    <RatingSummaryCard title="MINO" className={className} compact={compact}>
      {hasRating ? (
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p
              className={cn(
                "font-semibold tabular-nums tracking-tight",
                compact ? "text-lg" : "text-2xl"
              )}
            >
              {formatAverage(rating.average!)}
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                / 5
              </span>
            </p>
            <FractionalStars value={rating.average!} />
          </div>
          <p className="text-xs text-muted-foreground">
            {formatCount(rating.count)}{" "}
            {rating.count === 1 ? "note" : "notes"} équipe
          </p>
        </div>
      ) : (
        <p className="text-xs leading-snug text-muted-foreground">
          Aucune note MINO pour l&apos;instant
        </p>
      )}
    </RatingSummaryCard>
  )
}
