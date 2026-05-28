import Link from "next/link"

import { AlbumCover } from "@/components/catalog/album-cover"
import { StarRating } from "@/components/catalog/star-rating"
import { Badge } from "@/components/ui/badge"
import type { AlbumSummary } from "@/lib/catalog/types"
import { albumDetailRoute } from "@/lib/routes"
import { cn } from "@/lib/utils"

export type AlbumListRowProps = {
  album: AlbumSummary
  className?: string
}

export function AlbumListRow({ album, className }: AlbumListRowProps) {
  return (
    <Link
      href={albumDetailRoute(album.id)}
      className={cn(
        "flex items-center gap-4 rounded-lg border border-border/60 bg-card/50 px-3 py-2 transition-colors hover:bg-muted/40",
        className
      )}
    >
      <AlbumCover
        title={album.title}
        hue={album.coverHue}
        imageUrl={album.coverImageUrl}
        size="sm"
      />
      <div className="min-w-0 flex-1 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center">
        <div className="min-w-0">
          <p className="truncate font-medium">{album.title}</p>
          <p className="truncate text-sm text-muted-foreground">{album.artist}</p>
        </div>
        <span className="text-sm text-muted-foreground">
          {album.releaseYear > 0 ? album.releaseYear : "—"}
        </span>
        <span className="hidden truncate text-sm text-muted-foreground sm:block">
          {album.label}
        </span>
        <StarRating value={album.rating} />
      </div>
      {album.tags[0] ? (
        <Badge variant="outline" className="hidden shrink-0 md:inline-flex">
          {album.tags[0]}
        </Badge>
      ) : null}
    </Link>
  )
}
