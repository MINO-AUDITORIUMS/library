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
}

export function AlbumCard({ album, className }: AlbumCardProps) {
  return (
    <Link
      href={albumDetailRoute(album.id)}
      className={cn("group block h-full", className)}
    >
      <Card className="flex h-full flex-col gap-0 overflow-hidden py-0 transition-colors hover:bg-muted/30">
        <AlbumCover
          title={album.title}
          hue={album.coverHue}
          imageUrl={album.coverImageUrl}
          size="md"
        />
        <CardContent className="flex min-h-[148px] flex-1 flex-col gap-2 px-3 py-3">
          <div className="space-y-0.5">
            <p className="line-clamp-2 min-h-10 font-medium leading-snug group-hover:text-primary">
              {album.title}
            </p>
            <p className="line-clamp-1 text-sm text-muted-foreground">
              {album.artist}
            </p>
          </div>
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>{album.releaseYear > 0 ? album.releaseYear : "—"}</span>
            {album.label !== "—" ? (
              <span className="truncate">{album.label}</span>
            ) : null}
          </div>
          <div className="min-h-5">
            <MinoRatingStars rating={album.minoRating} />
          </div>
          <div className="mt-auto flex min-h-6 flex-wrap gap-1">
            {album.tags.length > 0
              ? album.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="muted" className="text-[10px]">
                    {tag}
                  </Badge>
                ))
              : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
