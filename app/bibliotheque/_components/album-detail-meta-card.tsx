import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatAlbumDuration, formatDisplayDate } from "@/lib/catalog/format"
import type { AlbumDetail } from "@/lib/catalog/types"
import { cn } from "@/lib/utils"

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="text-sm leading-snug">{value}</p>
    </div>
  )
}

export type AlbumDetailMetaCardProps = {
  album: AlbumDetail
  className?: string
}

export function AlbumDetailMetaCard({ album, className }: AlbumDetailMetaCardProps) {
  return (
    <Card className={cn("flex h-full flex-col gap-0 py-0", className)}>
      <CardHeader className="shrink-0 border-b border-border/60 px-4 py-3">
        <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Informations
        </CardTitle>
      </CardHeader>
      <CardContent className="grid flex-1 gap-x-4 gap-y-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetaItem
          label="Année"
          value={album.releaseYear > 0 ? String(album.releaseYear) : "—"}
        />
        <MetaItem label="Genre" value={`${album.genre} · ${album.subgenre}`} />
        <MetaItem label="Label" value={album.label} />
        <MetaItem label="Maison de disques" value={album.recordCompany} />
        <MetaItem label="Pays" value={album.country.trim() || "—"} />
        <MetaItem
          label="Durée"
          value={formatAlbumDuration(album.totalDurationSeconds)}
        />
        <MetaItem label="Producteurs" value={album.producers.join(", ")} />
        <MetaItem label="Certification" value={album.certification ?? "—"} />
        <MetaItem label="Ajouté le" value={formatDisplayDate(album.addedAt)} />
      </CardContent>
    </Card>
  )
}
