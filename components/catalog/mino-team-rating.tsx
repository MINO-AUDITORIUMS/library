import type { MinoRatingSummary } from "@/lib/catalog/ratings"
import { FractionalStars } from "@/components/catalog/fractional-stars"
import { cn } from "@/lib/utils"

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
    <div
      className={cn(
        "rounded-lg border border-border/70 bg-muted/20 px-4 py-3",
        className
      )}
    >
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        MINO
      </p>

      {hasRating ? (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
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
        <p className="mt-2 text-sm text-muted-foreground">
          Aucune note MINO pour l&apos;instant
        </p>
      )}
    </div>
  )
}
