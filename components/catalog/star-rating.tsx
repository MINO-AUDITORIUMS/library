import { StarIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export type StarRatingProps = {
  value: number | null
  max?: number
  size?: "sm" | "md"
  className?: string
}

export function StarRating({
  value,
  max = 5,
  size = "sm",
  className,
}: StarRatingProps) {
  if (value == null) {
    return (
      <span className={cn("text-xs text-muted-foreground", className)}>
        Non noté
      </span>
    )
  }

  const iconSize = size === "sm" ? "size-3.5" : "size-4"

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      aria-label={`Note : ${value} sur ${max}`}
    >
      {Array.from({ length: max }, (_, i) => (
        <StarIcon
          key={i}
          className={cn(
            iconSize,
            i < value
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-muted-foreground/40"
          )}
        />
      ))}
    </div>
  )
}
