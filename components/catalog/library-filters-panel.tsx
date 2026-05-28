"use client"

import { RotateCcwIcon, SlidersHorizontalIcon } from "lucide-react"

import { albumFormatLabels } from "@/lib/catalog/format-labels"
import {
  countActiveLibraryFilters,
  LIBRARY_FILTER_ALL,
  type LibraryFilterOptions,
  type LibraryFilters,
} from "@/lib/catalog/library-filters"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export type LibraryFiltersPanelProps = {
  filters: LibraryFilters
  options: LibraryFilterOptions
  onFiltersChange: (patch: Partial<LibraryFilters>) => void
  onReset: () => void
  className?: string
}

type FilterSelectProps = {
  id: string
  label: string
  value: string
  placeholder: string
  options: { value: string; label: string }[]
  onValueChange: (value: string) => void
  disabled?: boolean
}

function FilterSelect({
  id,
  label,
  value,
  placeholder,
  options,
  onValueChange,
  disabled = false,
}: FilterSelectProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger id={id} size="sm" className="w-full min-w-0">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={LIBRARY_FILTER_ALL}>Tous</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function LibraryFiltersPanel({
  filters,
  options,
  onFiltersChange,
  onReset,
  className,
}: LibraryFiltersPanelProps) {
  const activeCount = countActiveLibraryFilters(filters)

  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-card/40 p-4",
        className
      )}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontalIcon className="size-4 text-muted-foreground" />
          <p className="text-sm font-medium">Filtres</p>
          {activeCount > 0 ? (
            <Badge variant="secondary">{activeCount}</Badge>
          ) : null}
        </div>
        {activeCount > 0 ? (
          <Button type="button" variant="ghost" size="sm" onClick={onReset}>
            <RotateCcwIcon />
            Réinitialiser
          </Button>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        <FilterSelect
          id="library-filter-genre"
          label="Genre"
          value={filters.genre}
          placeholder="Genre"
          options={options.genres.map((genre) => ({
            value: genre,
            label: genre,
          }))}
          onValueChange={(genre) => onFiltersChange({ genre, subgenre: LIBRARY_FILTER_ALL })}
        />
        <FilterSelect
          id="library-filter-subgenre"
          label="Sous-genre"
          value={filters.subgenre}
          placeholder="Sous-genre"
          options={options.subgenres.map((subgenre) => ({
            value: subgenre,
            label: subgenre,
          }))}
          onValueChange={(subgenre) => onFiltersChange({ subgenre })}
          disabled={
            filters.genre !== LIBRARY_FILTER_ALL && options.subgenres.length === 0
          }
        />
        <FilterSelect
          id="library-filter-tag"
          label="Tag"
          value={filters.tag}
          placeholder="Tag"
          options={options.tags.map((tag) => ({ value: tag, label: tag }))}
          onValueChange={(tag) => onFiltersChange({ tag })}
        />
        <FilterSelect
          id="library-filter-country"
          label="Pays"
          value={filters.country}
          placeholder="Pays"
          options={options.countries.map((country) => ({
            value: country,
            label: country,
          }))}
          onValueChange={(country) => onFiltersChange({ country })}
        />
        <FilterSelect
          id="library-filter-format"
          label="Format"
          value={filters.format}
          placeholder="Format"
          options={options.formats.map((format) => ({
            value: format,
            label: albumFormatLabels[format],
          }))}
          onValueChange={(format) => onFiltersChange({ format })}
        />
        <FilterSelect
          id="library-filter-year-from"
          label="Année min."
          value={filters.yearFrom}
          placeholder="Depuis"
          options={options.years.map((year) => ({
            value: String(year),
            label: String(year),
          }))}
          onValueChange={(yearFrom) => onFiltersChange({ yearFrom })}
        />
        <FilterSelect
          id="library-filter-year-to"
          label="Année max."
          value={filters.yearTo}
          placeholder="Jusqu'à"
          options={options.years.map((year) => ({
            value: String(year),
            label: String(year),
          }))}
          onValueChange={(yearTo) => onFiltersChange({ yearTo })}
        />
        <FilterSelect
          id="library-filter-mino-rating"
          label="Note MINO min."
          value={filters.minMinoRating}
          placeholder="Note équipe"
          options={[
            { value: "1", label: "1★ et +" },
            { value: "2", label: "2★ et +" },
            { value: "3", label: "3★ et +" },
            { value: "4", label: "4★ et +" },
            { value: "5", label: "5★" },
          ]}
          onValueChange={(minMinoRating) => onFiltersChange({ minMinoRating })}
        />
      </div>
    </section>
  )
}
