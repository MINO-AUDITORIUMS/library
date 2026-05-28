import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatTrackDuration } from "@/lib/catalog/format"
import type { AlbumTrack } from "@/lib/catalog/types"

export type AlbumTracklistCardProps = {
  tracks: AlbumTrack[]
}

export function AlbumTracklistCard({ tracks }: AlbumTracklistCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="shrink-0">
        <CardTitle>Tracklist</CardTitle>
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
              <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="w-6 shrink-0 text-muted-foreground tabular-nums">
                    {track.position}
                  </span>
                  <span className="truncate">{track.title}</span>
                </div>
                <span className="shrink-0 text-muted-foreground tabular-nums">
                  {formatTrackDuration(track.durationSeconds)}
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
