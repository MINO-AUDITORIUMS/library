import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { AddToProgrammationButton } from "@/components/catalog/add-to-programmation-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlbumDetailActions } from "@/app/bibliotheque/_components/album-detail-actions"
import { AlbumDetailHero } from "@/app/bibliotheque/_components/album-detail-hero"
import { AlbumDetailSplit } from "@/app/bibliotheque/_components/album-detail-split"
import type { AlbumRatingsSnapshot } from "@/lib/catalog/db/album-user-ratings"
import type { AlbumComment, AlbumDetail } from "@/lib/catalog/types"
import { routes } from "@/lib/routes"

export type AlbumDetailViewProps = {
  album: AlbumDetail
  comments: AlbumComment[]
  currentUserId: string
  currentUserEmail: string
  albumRatings: AlbumRatingsSnapshot
}

export function AlbumDetailView({
  album,
  comments,
  currentUserId,
  currentUserEmail,
  albumRatings,
}: AlbumDetailViewProps) {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" className="w-fit" asChild>
          <Link href={routes.bibliotheque}>
            <ArrowLeftIcon />
            Bibliothèque
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <AddToProgrammationButton album={album} />
          <AlbumDetailActions
            albumId={album.id}
            albumTitle={album.title}
            canSyncTracks={album.canSyncTracks}
          />
        </div>
      </div>

      <AlbumDetailHero album={album} albumRatings={albumRatings} />

      <AlbumDetailSplit
        albumId={album.id}
        albumTitle={album.title}
        tracks={album.tracks}
        comments={comments}
        currentUserId={currentUserId}
        currentUserEmail={currentUserEmail}
      />

      {album.personalNotes ? (
        <Card>
          <CardHeader>
            <CardTitle>Notes personnelles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{album.personalNotes}</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
