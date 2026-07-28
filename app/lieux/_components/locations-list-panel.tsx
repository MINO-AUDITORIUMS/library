"use client"

import { MapPinIcon, PlusIcon, SearchIcon } from "lucide-react"
import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { Location, LocationType } from "@/lib/locations/types"

export type LocationsListPanelProps = {
  locations: Location[]
  selectedLocationId: string | null
  onSelectLocation: (locationId: string) => void
  onCreateLocation: () => void
  onHoverLocationIdChange?: (locationId: string | null) => void
  locationTypeById: Record<string, LocationType>
}

function typeLabel(
  location: Location,
  typeById: Record<string, LocationType>
) {
  return typeById[location.typeId]?.label ?? location.typeLabel
}

export function LocationsListPanel({
  locations,
  selectedLocationId,
  onSelectLocation,
  onCreateLocation,
  onHoverLocationIdChange,
  locationTypeById,
}: LocationsListPanelProps) {
  const handleHoverChange = onHoverLocationIdChange ?? (() => undefined)
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return locations
    return locations.filter((location) => {
      const haystack =
        `${location.name} ${location.city} ${location.address}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [locations, query])

  return (
    <Card className="h-full">
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Lieux</CardTitle>
          <Button variant="secondary" size="sm" onClick={onCreateLocation}>
            <PlusIcon className="mr-1 h-4 w-4" />
            Nouveau lieu
          </Button>
        </div>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un lieu…"
            className="pl-8"
          />
        </div>
      </CardHeader>
      <CardContent className="min-h-0">
        <div className="max-h-[calc(100svh-14rem)] overflow-auto pr-1">
          <div className="grid gap-2">
            {filtered.map((location) => {
              const isSelected = location.id === selectedLocationId
              return (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => onSelectLocation(location.id)}
                  onPointerEnter={() => handleHoverChange(location.id)}
                  onPointerLeave={() => handleHoverChange(null)}
                  onFocus={() => handleHoverChange(location.id)}
                  onBlur={() => handleHoverChange(null)}
                  className={[
                    "w-full rounded-lg border px-3 py-2 text-left transition-colors",
                    "hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                    isSelected ? "border-ring bg-muted/60" : "bg-background",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {location.name}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPinIcon className="h-3.5 w-3.5" />
                        <span className="truncate">
                          {location.city} · {location.address}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {typeLabel(location, locationTypeById)}
                    </Badge>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {location.rooms.length} salle
                    {location.rooms.length > 1 ? "s" : ""}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
