"use client"

import { formatEur } from "@/lib/format/money"
import type { ProjectFinanceSummary } from "@/lib/projects/finance-types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export type ProjectPnlCardProps = {
  summary: ProjectFinanceSummary
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone?: "positive" | "negative" | "muted"
}) {
  const className =
    tone === "positive"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "negative"
        ? "text-destructive"
        : tone === "muted"
          ? "text-muted-foreground"
          : ""

  return (
    <div className="rounded-lg border bg-background px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 text-sm font-semibold tabular-nums ${className}`}>
        {formatEur(value)}
      </div>
    </div>
  )
}

export function ProjectPnlCard({ summary }: ProjectPnlCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">P&L Overview</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <Metric label="Budget" value={summary.budgetedTotal} />
        <Metric
          label="Dépenses engagées"
          value={summary.engagedTotal}
          tone="negative"
        />
        <Metric
          label="Budget restant"
          value={summary.remainingBudget}
          tone={summary.remainingBudget >= 0 ? "positive" : "negative"}
        />
        <Metric
          label="Revenu billetterie (HT)"
          value={summary.actualTicketRevenue}
          tone="positive"
        />
        <Metric
          label="Potentiel billetterie (HT)"
          value={summary.potentialTicketRevenue}
          tone="muted"
        />
        <Metric
          label="Marge brute"
          value={summary.grossMargin}
          tone={summary.grossMargin >= 0 ? "positive" : "negative"}
        />
      </CardContent>
    </Card>
  )
}
