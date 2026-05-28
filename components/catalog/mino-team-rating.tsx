import { FractionalStars } from "@/components/catalog/fractional-stars"
import { RatingSummaryCard } from "@/components/catalog/rating-summary-card"
import type { MinoRatingSummary } from "@/lib/catalog/ratings"

export type MinoTeamRatingProps = {
  rating: MinoRatingSummary
  className?: string
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

export function MinoTeamRating({ rating, className }: MinoTeamRatingProps) {
  const hasRating = rating.count > 0 && rating.average != null

  return (
    <RatingSummaryCard title="MINO" className={className}>
      {hasRating ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="text-2xl font-semibold tabular-nums tracking-tight">
            {formatAverage(rating.average!)}
            <span className="text-base font-normal text-muted-foreground">
              {" "}
              / 5
            </span>
          </p>
          <FractionalStars value={rating.average!} />
          <p className="w-full text-sm text-muted-foreground">
            {formatCount(rating.count)}{" "}
            {rating.count === 1 ? "note" : "notes"} équipe
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Aucune note MINO pour l&apos;instant
        </p>
      )}
    </RatingSummaryCard>
  )
}
