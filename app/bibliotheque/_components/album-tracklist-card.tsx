import { AlbumTracklistEditButton } from "@/app/bibliotheque/_components/album-tracklist-edit-button"
import { TrackClipActions } from "@/components/catalog/track-clip-actions"
import { TrackCreditsPopover } from "@/components/catalog/track-credits-popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatTrackDuration } from "@/lib/catalog/format"
import type { AlbumTrack } from "@/lib/catalog/types"

export type AlbumTracklistCardProps = {
  albumId: string
  albumTitle: string
  tracks: AlbumTrack[]
}

type AlbumTrackRowProps = {
  albumId: string
  track: AlbumTrack
}

function AlbumTrackRow({ albumId, track }: AlbumTrackRowProps) {
  const hasCredits = track.writers.length > 0 || track.producers.length > 0

  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3 text-sm">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className="w-6 shrink-0 pt-0.5 text-muted-foreground tabular-nums">
          {track.position}
        </span>
        <div className="min-w-0 space-y-0.5">
          <div className="flex min-w-0 flex-wrap items-center gap-1">
            <p className="truncate">{track.title}</p>
            <TrackClipActions albumId={albumId} track={track} />
            {hasCredits ? (
              <TrackCreditsPopover
                trackTitle={track.title}
                writers={track.writers}
                producers={track.producers}
              />
            ) : null}
          </div>
          {track.featuring.length > 0 ? (
            <p className="truncate text-xs font-normal text-muted-foreground">
              Feat. {track.featuring.join(", ")}
            </p>
          ) : null}
        </div>
      </div>
      <span className="shrink-0 pt-0.5 text-muted-foreground tabular-nums">
        {formatTrackDuration(track.durationSeconds)}
      </span>
    </div>
  )
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
              <AlbumTrackRow albumId={albumId} track={track} />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
