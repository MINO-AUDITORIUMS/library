import { DiscogsCommunityRating } from "@/components/catalog/discogs-community-rating"
import { MinoTeamRating } from "@/components/catalog/mino-team-rating"
import { PersonalRatingEditor } from "@/components/catalog/personal-rating-editor"
import type { DiscogsCommunityStats } from "@/lib/catalog/discogs/types"
import type { MinoRatingSummary } from "@/lib/catalog/ratings"
import { cn } from "@/lib/utils"

export type AlbumRatingsPanelProps = {
  albumId: string
  myRating: number | null
  minoRating: MinoRatingSummary
  discogsCommunity: DiscogsCommunityStats | null
  className?: string
}

export function AlbumRatingsPanel({
  albumId,
  myRating,
  minoRating,
  discogsCommunity,
  className,
}: AlbumRatingsPanelProps) {
  return (
    <div
      className={cn(
        "grid h-full auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-3",
        !discogsCommunity && "lg:grid-cols-2",
        className
      )}
    >
      <PersonalRatingEditor
        key={`${albumId}-${myRating ?? "none"}`}
        albumId={albumId}
        initialRating={myRating}
      />
      <MinoTeamRating rating={minoRating} />
      {discogsCommunity ? (
        <DiscogsCommunityRating stats={discogsCommunity} />
      ) : null}
    </div>
  )
}
