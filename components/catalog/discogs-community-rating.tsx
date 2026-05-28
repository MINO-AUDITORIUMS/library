import { FractionalStars } from "@/components/catalog/fractional-stars"
import type { DiscogsCommunityStats } from "@/lib/catalog/discogs/types"
import { cn } from "@/lib/utils"

export type DiscogsCommunityRatingProps = {
  stats: DiscogsCommunityStats
  className?: string
}

function formatCount(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value)
}

function formatAverage(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  )
}

export function DiscogsCommunityRating({
  stats,
  className,
}: DiscogsCommunityRatingProps) {
  const hasRating = stats.ratingCount > 0 && stats.averageRating > 0

  return (
    <div
      className={cn(
        "rounded-lg border border-border/70 bg-muted/20 px-4 py-3",
        className
      )}
    >
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Communauté Discogs
      </p>

      {hasRating ? (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="text-2xl font-semibold tabular-nums tracking-tight">
            {formatAverage(stats.averageRating)}
            <span className="text-base font-normal text-muted-foreground">
              {" "}
              / 5
            </span>
          </p>
          <FractionalStars value={stats.averageRating} />
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">
          Pas encore de note communautaire
        </p>
      )}

      <div className="mt-3 space-y-1.5">
        <StatRow
          label="En collection"
          value={formatCount(stats.inCollection)}
        />
        <StatRow label="En wantlist" value={formatCount(stats.inWantlist)} />
        {hasRating ? (
          <StatRow label="Notes" value={formatCount(stats.ratingCount)} />
        ) : null}
      </div>
    </div>
  )
}
