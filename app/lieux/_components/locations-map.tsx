"use client"

import { useEffect, type RefObject } from "react"
import { MapPinIcon } from "lucide-react"

import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerTooltip,
  useMap,
  type MapRef,
} from "@/components/ui/map"
import type { Location } from "@/lib/locations/types"

export type LocationsMapProps = {
  mapRef: RefObject<MapRef | null>
  locations: Location[]
  selectedLocationId: string | null
  hoveredLocationId: string | null
  onSelectLocation: (locationId: string) => void
}

function FrenchBasemapLabels() {
  const { map, isLoaded } = useMap()

  useEffect(() => {
    if (!map || !isLoaded) return

    const frenchTextField: unknown[] = [
      "coalesce",
      ["get", "name:fr"],
      ["get", "name_fr"],
      ["get", "name"],
    ]

    const apply = () => {
      const style = map.getStyle()
      const layers = style?.layers ?? []
      for (const layer of layers) {
        if (!layer || layer.type !== "symbol") continue
        try {
          map.setLayoutProperty(layer.id, "text-field", frenchTextField as never)
        } catch {
          continue
        }
      }
    }

    apply()
    map.on("styledata", apply)
    return () => {
      map.off("styledata", apply)
    }
  }, [map, isLoaded])

  return null
}

function markerColor(typeCode: string) {
  switch (typeCode) {
    case "mino-venue":
      return "bg-primary text-primary-foreground"
    case "cinema":
      return "bg-blue-500 text-white"
    case "outdoor":
      return "bg-emerald-500 text-white"
    case "other":
      return "bg-zinc-700 text-white"
    default:
      return "bg-zinc-700 text-white"
  }
}

export function LocationsMap({
  mapRef,
  locations,
  selectedLocationId,
  hoveredLocationId,
  onSelectLocation,
}: LocationsMapProps) {
  return (
    <Map
      ref={mapRef}
      className="h-full"
      center={[2.2137, 46.2276]}
      zoom={5.2}
    >
      <FrenchBasemapLabels />
      <MapControls showZoom showLocate />
      {locations.map((location) => {
        const isSelected = selectedLocationId === location.id
        const isHovered = hoveredLocationId === location.id
        const priority = isSelected ? 2 : isHovered ? 1 : 0

        return (
          <MapMarker
            key={`${location.id}-${priority}`}
            longitude={location.position.longitude}
            latitude={location.position.latitude}
            onClick={() => onSelectLocation(location.id)}
          >
            <MarkerContent className="group">
              <div className="relative -translate-y-2">
                <div
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-full border shadow-md transition-transform",
                    markerColor(location.typeCode),
                    isSelected
                      ? "scale-110 border-ring ring-2 ring-ring/50"
                      : isHovered
                        ? "scale-125 border-ring ring-2 ring-ring/50"
                        : "border-white/40 hover:scale-105",
                  ].join(" ")}
                >
                  <MapPinIcon className="h-3.5 w-3.5" />
                </div>
                <div className="absolute -right-2 -bottom-2">
                  <span
                    className={[
                      "inline-flex h-4 min-w-4 items-center justify-center rounded-full border bg-background px-1 text-[10px] font-medium shadow-sm",
                      isSelected || isHovered ? "border-ring" : "border-border",
                    ].join(" ")}
                  >
                    {location.rooms.length}
                  </span>
                </div>
              </div>
            </MarkerContent>
            <MarkerTooltip>{location.name}</MarkerTooltip>
          </MapMarker>
        )
      })}
    </Map>
  )
}
