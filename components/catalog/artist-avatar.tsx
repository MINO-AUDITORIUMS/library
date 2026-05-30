import { Mic2Icon } from "lucide-react"

import { cn } from "@/lib/utils"

export type ArtistAvatarProps = {
  name: string
  hue: number
  imageUrl?: string | null
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "size-12 rounded-full [&_svg]:size-5",
  md: "size-24 rounded-full [&_svg]:size-8",
  lg: "size-32 rounded-full [&_svg]:size-10",
}

export function ArtistAvatar({
  name,
  hue,
  imageUrl,
  size = "md",
  className,
}: ArtistAvatarProps) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={cn(
          "shrink-0 object-cover ring-1 ring-border/60",
          sizeClasses[size],
          className
        )}
      />
    )
  }

  return (
    <div
      role="img"
      aria-label={name}
      className={cn(
        "flex shrink-0 items-center justify-center ring-1 ring-border/60",
        sizeClasses[size],
        className
      )}
      style={{
        backgroundImage: `linear-gradient(135deg, hsl(${hue} 35% 22%), hsl(${hue} 45% 12%))`,
      }}
    >
      <Mic2Icon className="text-white/70" />
    </div>
  )
}
