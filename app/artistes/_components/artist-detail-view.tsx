import { ArtistDetailHero } from "@/app/artistes/_components/artist-detail-hero"
import { AlbumCard } from "@/components/catalog/album-card"
import type { ArtistDetail } from "@/lib/catalog/types"

export type ArtistDetailViewProps = {
  artist: ArtistDetail
}

export function ArtistDetailView({ artist }: ArtistDetailViewProps) {
  return (
    <div className="flex w-full flex-col gap-6">
      <ArtistDetailHero artist={artist} />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Albums dans la bibliothèque
          </h2>
        </div>

        {artist.albums.length === 0 ? (
          <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
            Aucun album de cet artiste dans la bibliothèque pour le moment.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {artist.albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
