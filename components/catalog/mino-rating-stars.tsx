import { StarRating } from "@/components/catalog/star-rating"
import type { MinoRatingSummary } from "@/lib/catalog/ratings"
import { cn } from "@/lib/utils"

export type MinoRatingStarsProps = {
  rating: MinoRatingSummary
  size?: "sm" | "md"
  className?: string
}

export function MinoRatingStars({
  rating,
  size = "sm",
  className,
}: MinoRatingStarsProps) {
  if (rating.count === 0 || rating.average == null) {
    return (
      <span className={cn("text-xs text-muted-foreground", className)}>
        —
      </span>
    )
  }

  return (
    <StarRating
      value={Math.round(rating.average)}
      size={size}
      className={className}
    />
  )
}
