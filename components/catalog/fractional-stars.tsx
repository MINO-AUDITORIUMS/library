import { StarIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export type FractionalStarsProps = {
  value: number
  max?: number
  className?: string
  iconClassName?: string
}

export function FractionalStars({
  value,
  max = 5,
  className,
  iconClassName = "size-4",
}: FractionalStarsProps) {
  const clamped = Math.min(max, Math.max(0, value))

  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-hidden>
      {Array.from({ length: max }, (_, index) => {
        const fill = Math.min(1, Math.max(0, clamped - index))
        return (
          <span key={index} className={cn("relative inline-flex", iconClassName)}>
            <StarIcon
              className={cn(iconClassName, "text-muted-foreground/35")}
            />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <StarIcon
                className={cn(iconClassName, "fill-amber-400 text-amber-400")}
              />
            </span>
          </span>
        )
      })}
    </div>
  )
}
