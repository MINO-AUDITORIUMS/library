"use client"

import Link from "next/link"
import { Grid3x3Icon, LayoutListIcon, PlusIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { routes } from "@/lib/routes"
import { cn } from "@/lib/utils"

export type LibraryViewMode = "grid" | "list"

export type LibraryToolbarProps = {
  query: string
  onQueryChange: (value: string) => void
  viewMode: LibraryViewMode
  onViewModeChange: (mode: LibraryViewMode) => void
  totalCount: number
  filteredCount: number
}

export function LibraryToolbar({
  query,
  onQueryChange,
  viewMode,
  onViewModeChange,
  totalCount,
  filteredCount,
}: LibraryToolbarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bibliothèque</h1>
        <p className="text-sm text-muted-foreground">
          {filteredCount === totalCount
            ? `${totalCount} albums`
            : `${filteredCount} sur ${totalCount} albums`}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Rechercher titre, artiste, label…"
            className="pl-8"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border p-0.5">
            <Button
              type="button"
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon-sm"
              aria-label="Vue grille"
              aria-pressed={viewMode === "grid"}
              onClick={() => onViewModeChange("grid")}
            >
              <Grid3x3Icon />
            </Button>
            <Button
              type="button"
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon-sm"
              aria-label="Vue liste"
              aria-pressed={viewMode === "list"}
              onClick={() => onViewModeChange("list")}
            >
              <LayoutListIcon />
            </Button>
          </div>

          <Button asChild>
            <Link href={routes.bibliothequeNew}>
              <PlusIcon />
              Ajouter un album
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
