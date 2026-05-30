import { ArtistAvatar } from "@/components/catalog/artist-avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { ArtistDetail } from "@/lib/catalog/types"

export type ArtistDetailHeroProps = {
  artist: ArtistDetail
}

export function ArtistDetailHero({ artist }: ArtistDetailHeroProps) {
  return (
    <Card className="py-0">
      <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-start">
        <ArtistAvatar
          name={artist.name}
          hue={artist.coverHue}
          imageUrl={artist.imageUrl}
          size="lg"
          className="mx-auto sm:mx-0"
        />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="space-y-1 text-center sm:text-left">
            <h1 className="text-2xl font-semibold tracking-tight">{artist.name}</h1>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              {artist.country ? (
                <Badge variant="secondary">{artist.country}</Badge>
              ) : null}
              <Badge variant="muted">
                {artist.albumCount} album{artist.albumCount > 1 ? "s" : ""} en
                bibliothèque
              </Badge>
            </div>
          </div>
          {artist.bio ? (
            <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
              {artist.bio}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
