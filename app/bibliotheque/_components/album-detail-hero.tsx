import Link from "next/link"

import { AlbumCoverEditable } from "@/app/bibliotheque/_components/album-cover-editable"
import { AlbumRatingsPanel } from "@/components/catalog/album-ratings-panel"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { AlbumRatingsSnapshot } from "@/lib/catalog/db/album-user-ratings"
import type { DiscogsCommunityStats } from "@/lib/catalog/discogs/types"
import type { AlbumDetail } from "@/lib/catalog/types"
import { artistDetailRoute } from "@/lib/routes"

export type AlbumDetailHeroProps = {
  album: AlbumDetail
  albumRatings: AlbumRatingsSnapshot
  discogsCommunity: DiscogsCommunityStats | null
}

export function AlbumDetailHero({
  album,
  albumRatings,
  discogsCommunity,
}: AlbumDetailHeroProps) {
  return (
    <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,400px)_1fr]">
      <Card className="h-full py-0">
        <CardContent className="py-5">
          <div className="flex gap-4">
            <AlbumCoverEditable
              albumId={album.id}
              title={album.title}
              coverHue={album.coverHue}
              coverImageUrl={album.coverImageUrl}
              className="size-40"
            />

            <div className="flex h-40 min-w-0 flex-1 flex-col justify-between overflow-hidden">
              <div className="min-w-0 space-y-0.5">
                <h1 className="truncate text-xl font-semibold tracking-tight">
                  {album.title}
                </h1>
                {album.artistId ? (
                  <Link
                    href={artistDetailRoute(album.artistId)}
                    className="block truncate text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {album.artist}
                  </Link>
                ) : (
                  <p className="truncate text-sm text-muted-foreground">
                    {album.artist}
                  </p>
                )}
              </div>

              <div className="min-h-0 space-y-2 overflow-hidden">
                {album.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {album.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="px-2 py-0 text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : null}

                {album.description ? (
                  <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                    {album.description}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlbumRatingsPanel
        albumId={album.id}
        myRating={albumRatings.myRating}
        minoRating={albumRatings.minoRating}
        discogsCommunity={discogsCommunity}
        className="h-full"
      />
    </div>
  )
}
