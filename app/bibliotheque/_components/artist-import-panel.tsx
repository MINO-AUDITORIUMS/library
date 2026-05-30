import Link from "next/link"
import { UserIcon } from "lucide-react"

import { ArtistAvatar } from "@/components/catalog/artist-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ArtistImportPreview } from "@/lib/catalog/build-artist-preview"
import { coverHueFromId } from "@/lib/catalog/cover-hue"
import { artistDetailRoute } from "@/lib/routes"

export type ArtistImportPanelProps = {
  preview: ArtistImportPreview
}

export function ArtistImportPanel({ preview }: ArtistImportPanelProps) {
  const hue = preview.libraryArtistId
    ? coverHueFromId(preview.libraryArtistId)
    : coverHueFromId(preview.name)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <UserIcon className="size-4 text-muted-foreground" />
          Artiste
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <ArtistAvatar
          name={preview.name}
          hue={hue}
          imageUrl={preview.imageUrl}
          size="md"
        />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="space-y-1">
            <p className="text-lg font-semibold tracking-tight">{preview.name}</p>
            {preview.country ? (
              <p className="text-sm text-muted-foreground">{preview.country}</p>
            ) : null}
          </div>

          {preview.bio ? (
            <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">
              {preview.bio}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {preview.libraryAlbumCount > 0
                ? `${preview.libraryAlbumCount} album${
                    preview.libraryAlbumCount > 1 ? "s" : ""
                  } dans la bibliothèque`
                : "Nouvel artiste dans la bibliothèque"}
            </Badge>
          </div>

          {preview.libraryArtistId ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={artistDetailRoute(preview.libraryArtistId)}>
                Voir la fiche artiste
              </Link>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
