import Link from "next/link"

import { ArtistAvatar } from "@/components/catalog/artist-avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { ArtistSummary } from "@/lib/catalog/types"
import { artistDetailRoute } from "@/lib/routes"
import { cn } from "@/lib/utils"

export type ArtistCardProps = {
  artist: ArtistSummary
  className?: string
}

export function ArtistCard({ artist, className }: ArtistCardProps) {
  return (
    <Link
      href={artistDetailRoute(artist.id)}
      className={cn("group block h-full", className)}
    >
      <Card className="flex h-full flex-col gap-0 overflow-hidden py-0 transition-colors hover:bg-muted/30">
        <CardContent className="flex flex-1 flex-col items-center gap-3 px-4 py-5 text-center">
          <ArtistAvatar
            name={artist.name}
            hue={artist.coverHue}
            imageUrl={artist.imageUrl}
            size="md"
          />
          <div className="min-w-0 space-y-1">
            <p className="line-clamp-2 font-medium leading-snug group-hover:text-primary">
              {artist.name}
            </p>
            {artist.country ? (
              <p className="text-xs text-muted-foreground">{artist.country}</p>
            ) : null}
          </div>
          <Badge variant="muted" className="mt-auto text-[10px]">
            {artist.albumCount} album{artist.albumCount > 1 ? "s" : ""}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  )
}
