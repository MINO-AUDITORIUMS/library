import { ArrowRightIcon } from "lucide-react"
import Link from "next/link"

import { AlbumCard } from "@/components/catalog/album-card"
import { Button } from "@/components/ui/button"
import type { AlbumSummary } from "@/lib/catalog/types"
import { routes } from "@/lib/routes"

export type HomeRecentAlbumsProps = {
  albums: AlbumSummary[]
}

export function HomeRecentAlbums({ albums }: HomeRecentAlbumsProps) {
  if (albums.length === 0) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Derniers ajouts
        </h2>
        <div className="rounded-xl border border-dashed px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Aucun album pour le moment. Importe le premier depuis Discogs ou
            MusicBrainz.
          </p>
          <Button asChild className="mt-4">
            <Link href={routes.bibliothequeNew}>
              Ajouter un album
              <ArrowRightIcon />
            </Link>
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Derniers ajouts
          </h2>
          <p className="text-sm text-muted-foreground">
            Les albums récemment importés.
          </p>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href={routes.bibliotheque}>
            Tout voir
            <ArrowRightIcon />
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {albums.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>
    </section>
  )
}
