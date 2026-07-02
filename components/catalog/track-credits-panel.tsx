"use client"

export type TrackCreditsPanelProps = {
  trackTitle: string
  writers: string[]
  producers: string[]
}

function CreditBlock({ label, names }: { label: string; names: string[] }) {
  if (names.length === 0) return null

  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      {names.length === 1 ? (
        <p className="text-sm leading-snug">{names[0]}</p>
      ) : (
        <ul className="space-y-0.5">
          {names.map((name) => (
            <li key={name} className="text-sm leading-snug">
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function TrackCreditsPanel({
  trackTitle,
  writers,
  producers,
}: TrackCreditsPanelProps) {
  return (
    <div className="space-y-3">
      <p className="truncate text-xs font-medium text-foreground">
        {trackTitle}
      </p>
      <CreditBlock label="Écriture" names={writers} />
      <CreditBlock label="Production" names={producers} />
    </div>
  )
}

