"use client"

import {
  CalendarDaysIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ImageIcon,
  ListIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { formatListeningDuration } from "@/lib/programmation/duration"
import {
  formatDayTitle,
  formatMonthYear,
  formatWeekRange,
} from "@/lib/programmation/dates"
import type {
  PeriodSummary,
  PlanningDisplayMode,
  PlanningView,
} from "@/lib/programmation/types"

export type ProgrammationToolbarProps = {
  view: PlanningView
  displayMode: PlanningDisplayMode
  anchorDate: Date
  summary: PeriodSummary
  onViewChange: (view: PlanningView) => void
  onDisplayModeChange: (mode: PlanningDisplayMode) => void
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
}

const viewOptions: { value: PlanningView; label: string; icon: typeof CalendarIcon }[] = [
  { value: "day", label: "Jour", icon: CalendarIcon },
  { value: "week", label: "Semaine", icon: CalendarDaysIcon },
  { value: "month", label: "Mois", icon: CalendarDaysIcon },
]

function periodLabel(view: PlanningView, anchorDate: Date) {
  if (view === "day") return formatDayTitle(anchorDate)
  if (view === "week") return formatWeekRange(anchorDate)
  return formatMonthYear(anchorDate)
}

export function ProgrammationToolbar({
  view,
  displayMode,
  anchorDate,
  summary,
  onViewChange,
  onDisplayModeChange,
  onPrevious,
  onNext,
  onToday,
}: ProgrammationToolbarProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Programmation</h1>
          <p className="text-sm text-muted-foreground">
            Planifie les séances d&apos;écoute à partir du catalogue MINO.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-border p-0.5">
            {viewOptions.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={view === option.value ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onViewChange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>

          <div className="flex rounded-lg border border-border p-0.5">
            <Button
              type="button"
              variant={displayMode === "visual" ? "secondary" : "ghost"}
              size="icon-sm"
              aria-label="Mode visuel"
              onClick={() => onDisplayModeChange("visual")}
            >
              <ImageIcon />
            </Button>
            <Button
              type="button"
              variant={displayMode === "text" ? "secondary" : "ghost"}
              size="icon-sm"
              aria-label="Mode textuel"
              onClick={() => onDisplayModeChange("text")}
            >
              <ListIcon />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="icon-sm" onClick={onPrevious}>
            <ChevronLeftIcon />
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onToday}>
            Aujourd&apos;hui
          </Button>
          <Button type="button" variant="outline" size="icon-sm" onClick={onNext}>
            <ChevronRightIcon />
          </Button>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium capitalize">{periodLabel(view, anchorDate)}</p>
          {summary.sessionCount > 0 ? (
            <p className="text-sm text-muted-foreground">
              {formatListeningDuration(summary.totalMinutes)} · {summary.sessionCount}{" "}
              album{summary.sessionCount > 1 ? "s" : ""}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Aucune séance programmée</p>
          )}
        </div>
      </div>
    </div>
  )
}
