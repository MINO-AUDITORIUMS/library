import { Disc3Icon } from "lucide-react"

import { cn } from "@/lib/utils"

export type AlbumCoverProps = {
  title: string
  hue: number
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "size-12 rounded-md [&_svg]:size-5",
  md: "aspect-square w-full rounded-lg [&_svg]:size-10",
  lg: "aspect-square w-full max-w-xs rounded-xl [&_svg]:size-16",
}

export function AlbumCover({
  title,
  hue,
  size = "md",
  className,
}: AlbumCoverProps) {
  return (
    <div
      role="img"
      aria-label={`Pochette de ${title}`}
      className={cn(
        "flex shrink-0 items-center justify-center bg-linear-to-br from-background to-muted ring-1 ring-border/60",
        sizeClasses[size],
        className
      )}
      style={{
        backgroundImage: `linear-gradient(135deg, hsl(${hue} 35% 22%), hsl(${hue} 45% 12%))`,
      }}
    >
      <Disc3Icon className="text-white/70" />
    </div>
  )
}
