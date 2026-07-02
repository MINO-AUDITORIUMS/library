import Link from "next/link"

import { AlbumCover } from "@/components/catalog/album-cover"
import { MinoRatingStars } from "@/components/catalog/mino-rating-stars"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { AlbumSummary } from "@/lib/catalog/types"
import { albumDetailRoute } from "@/lib/routes"
import { cn } from "@/lib/utils"

export type AlbumCardProps = {
  album: AlbumSummary
  className?: string
  variant?: "default" | "compact"
}

export function AlbumCard({
  album,
  className,
  variant = "default",
}: AlbumCardProps) {
  const compact = variant === "compact"

  return (
    <Link
      href={albumDetailRoute(album.id)}
      className={cn("group block h-full", className)}
    >
      <Card
        className={cn(
          "flex h-full flex-col gap-0 overflow-hidden py-0 transition-colors hover:bg-muted/30",
          compact && "rounded-md"
        )}
      >
        <AlbumCover
          title={album.title}
          hue={album.coverHue}
          imageUrl={album.coverImageUrl}
          size={compact ? "xs" : "md"}
        />
        <CardContent
          className={cn(
            "flex flex-1 flex-col",
            compact ? "gap-1 px-2.5 py-2" : "min-h-[148px] gap-2 px-3 py-3"
          )}
        >
          <div className={compact ? "space-y-0" : "space-y-0.5"}>
            <p
              className={cn(
                "line-clamp-2 font-medium leading-snug group-hover:text-primary",
                compact
                  ? "text-sm leading-tight"
                  : "min-h-10 leading-snug"
              )}
            >
              {album.title}
            </p>
            <p
              className={cn(
                "line-clamp-1 text-muted-foreground",
                compact ? "text-xs" : "text-sm"
              )}
            >
              {album.artist}
            </p>
          </div>
          <div
            className={cn(
              "flex items-center justify-between gap-2 text-muted-foreground",
              compact ? "text-[11px]" : "text-xs"
            )}
          >
            <span>{album.releaseYear > 0 ? album.releaseYear : "—"}</span>
            {!compact && album.label !== "—" ? (
              <span className="truncate">{album.label}</span>
            ) : null}
          </div>
          <MinoRatingStars rating={album.minoRating} size="sm" />
          {!compact && album.tags.length > 0 ? (
            <div className="mt-auto flex min-h-6 flex-wrap gap-1">
              {album.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="muted" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  )
}
