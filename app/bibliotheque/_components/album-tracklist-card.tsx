import { AlbumTracklistEditButton } from "@/app/bibliotheque/_components/album-tracklist-edit-button"
import { AlbumTracklistRow } from "@/app/bibliotheque/_components/album-tracklist-row"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { AlbumTrack } from "@/lib/catalog/types"

export type AlbumTracklistCardProps = {
  albumId: string
  albumTitle: string
  tracks: AlbumTrack[]
}

export function AlbumTracklistCard({
  albumId,
  albumTitle,
  tracks,
}: AlbumTracklistCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex shrink-0 flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle>Tracklist</CardTitle>
        <AlbumTracklistEditButton albumId={albumId} albumTitle={albumTitle} />
      </CardHeader>
      <CardContent className="space-y-0 p-0">
        {tracks.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">
            Aucune piste enregistrée.
          </p>
        ) : (
          tracks.map((track, index) => (
            <div key={track.position}>
              {index > 0 ? <Separator /> : null}
              <AlbumTracklistRow albumId={albumId} track={track} />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
