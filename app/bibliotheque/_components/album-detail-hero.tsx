import Link from "next/link"

import { AlbumCoverEditable } from "@/app/bibliotheque/_components/album-cover-editable"
import { AlbumDetailMetaCard } from "@/app/bibliotheque/_components/album-detail-meta-card"
import { MinoTeamRating } from "@/components/catalog/mino-team-rating"
import { PersonalRatingEditor } from "@/components/catalog/personal-rating-editor"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { AlbumRatingsSnapshot } from "@/lib/catalog/db/album-user-ratings"
import type { AlbumDetail } from "@/lib/catalog/types"
import { artistDetailRoute } from "@/lib/routes"

export type AlbumDetailHeroProps = {
  album: AlbumDetail
  albumRatings: AlbumRatingsSnapshot
}

export function AlbumDetailHero({
  album,
  albumRatings,
}: AlbumDetailHeroProps) {
  return (
    <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,320px)_1fr]">
      <Card className="h-full py-0">
        <CardContent className="py-4">
          <div className="flex gap-4">
            <AlbumCoverEditable
              albumId={album.id}
              title={album.title}
              coverHue={album.coverHue}
              coverImageUrl={album.coverImageUrl}
              className="size-36 shrink-0"
            />

            <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
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
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,11.5rem)_minmax(0,11.5rem)_minmax(0,1fr)]">
        <PersonalRatingEditor
          key={`${album.id}-${albumRatings.myRating ?? "none"}`}
          albumId={album.id}
          initialRating={albumRatings.myRating}
          compact
        />
        <MinoTeamRating rating={albumRatings.minoRating} compact />
        <AlbumDetailMetaCard
          album={album}
          className="sm:col-span-2 xl:col-span-1"
        />
      </div>
    </div>
  )
}
