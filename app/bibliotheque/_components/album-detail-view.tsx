import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { AlbumCover } from "@/components/catalog/album-cover"
import { StarRating } from "@/components/catalog/star-rating"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlbumDetailSplit } from "@/app/bibliotheque/_components/album-detail-split"
import { formatDuration } from "@/lib/catalog/format"
import type { AlbumComment, AlbumDetail } from "@/lib/catalog/types"
import { routes } from "@/lib/routes"

export type AlbumDetailViewProps = {
  album: AlbumDetail
  comments: AlbumComment[]
  currentUserId: string
  currentUserEmail: string
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="text-sm">{value}</p>
    </div>
  )
}

export function AlbumDetailView({
  album,
  comments,
  currentUserId,
  currentUserEmail,
}: AlbumDetailViewProps) {
  return (
    <div className="flex w-full flex-col gap-6">
      <Button variant="ghost" size="sm" className="w-fit" asChild>
        <Link href={routes.bibliotheque}>
          <ArrowLeftIcon />
          Bibliothèque
        </Link>
      </Button>

      <div className="grid gap-8 md:grid-cols-[minmax(0,240px)_1fr]">
        <AlbumCover
          title={album.title}
          hue={album.coverHue}
          imageUrl={album.coverImageUrl}
          size="lg"
        />

        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">{album.title}</h1>
            <p className="text-lg text-muted-foreground">{album.artist}</p>
            <StarRating value={album.rating} size="md" />
          </div>

          {album.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {album.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}

          <p className="text-sm leading-relaxed text-muted-foreground">
            {album.description}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetaItem
            label="Année"
            value={album.releaseYear > 0 ? String(album.releaseYear) : "—"}
          />
          <MetaItem label="Genre" value={`${album.genre} · ${album.subgenre}`} />
          <MetaItem label="Label" value={album.label} />
          <MetaItem label="Maison de disques" value={album.recordCompany} />
          <MetaItem label="Pays" value={album.country} />
          <MetaItem
            label="Durée"
            value={formatDuration(album.totalDurationSeconds)}
          />
          <MetaItem
            label="Producteurs"
            value={album.producers.join(", ")}
          />
          <MetaItem
            label="Certification"
            value={album.certification ?? "—"}
          />
          <MetaItem label="Ajouté le" value={album.addedAt} />
        </CardContent>
      </Card>

      <AlbumDetailSplit
        albumId={album.id}
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
