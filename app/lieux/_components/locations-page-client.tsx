"use client"

import { useEffect, useMemo, useRef, useState } from "react"

import { MapPinIcon } from "lucide-react"

import { LocationsDetailCard } from "@/app/lieux/_components/locations-detail-card"
import { LocationsListPanel } from "@/app/lieux/_components/locations-list-panel"
import type { Location } from "@/app/lieux/_components/mock-locations"
import { mockLocations } from "@/app/lieux/_components/mock-locations"
import {
  LocationCreateDialog,
  type LocationCreateValues,
} from "@/app/lieux/_components/location-create-dialog"
import type { LocationEditValues } from "@/app/lieux/_components/location-edit-dialog"
import { useLocationTypes } from "@/app/lieux/_components/use-location-types"
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerTooltip,
  useMap,
  type MapRef,
} from "@/components/ui/map"
import { Badge } from "@/components/ui/badge"

type LocationById = Record<string, Location>

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

function markerColor(typeId: string) {
  switch (typeId) {
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

function createRoomName(roomsCount: number) {
  return roomsCount === 0 ? "Salle principale" : `Salle ${roomsCount + 1}`
}

function nextId(prefix: string) {
  return `${prefix}-${Math.random().toString(16).slice(2)}`
}

export function LocationsPageClient() {
  const mapRef = useRef<MapRef | null>(null)
  const { types, typeById, addType, removeType, updateTypeLabel } =
    useLocationTypes()
  const [locations, setLocations] = useState<Location[]>(() => mockLocations)
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  )
  const [hoveredLocationId, setHoveredLocationId] = useState<string | null>(
    null,
  )
  const [createOpen, setCreateOpen] = useState(false)

  const locationsById = useMemo<LocationById>(() => {
    return Object.fromEntries(locations.map((l) => [l.id, l]))
  }, [locations])

  const selectedLocation = selectedLocationId
    ? locationsById[selectedLocationId]
    : null

  const usageCountByTypeId = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const location of locations) {
      counts[location.typeId] = (counts[location.typeId] ?? 0) + 1
    }
    return counts
  }, [locations])

  const defaultViewport = useMemo(
    () => ({
      center: [2.2137, 46.2276] as [number, number],
      zoom: 5.2,
    }),
    [],
  )

  const handleSelectLocation = (locationId: string) => {
    setSelectedLocationId(locationId)
    const location = locationsById[locationId]
    if (!location) return
    mapRef.current?.flyTo({
      center: [location.position.longitude, location.position.latitude],
      zoom: 12.8,
      duration: 900,
    })
  }

  const handleCloseDetail = () => {
    setSelectedLocationId(null)
  }

  const handleAddRoom = (locationId: string) => {
    setLocations((prev) =>
      prev.map((location) => {
        if (location.id !== locationId) return location
        const roomId = nextId("room")
        const roomName = createRoomName(location.rooms.length)
        return {
          ...location,
          rooms: [...location.rooms, { id: roomId, name: roomName }],
        }
      }),
    )
  }

  const handleRemoveRoom = (locationId: string, roomId: string) => {
    setLocations((prev) =>
      prev.map((location) => {
        if (location.id !== locationId) return location
        return {
          ...location,
          rooms: location.rooms.filter((r) => r.id !== roomId),
        }
      }),
    )
  }

  const handleUpdateRoomCapacity = (
    locationId: string,
    roomId: string,
    capacity: number | null,
  ) => {
    setLocations((prev) =>
      prev.map((location) => {
        if (location.id !== locationId) return location
        return {
          ...location,
          rooms: location.rooms.map((room) =>
            room.id === roomId ? { ...room, capacity: capacity ?? undefined } : room,
          ),
        }
      }),
    )
  }

  const handleUpdateLocation = (locationId: string, values: LocationEditValues) => {
    setLocations((prev) => {
      const next = prev.map((location) =>
        location.id === locationId ? { ...location, ...values } : location,
      )

      if (selectedLocationId === locationId && values.position) {
        mapRef.current?.flyTo({
          center: [values.position.longitude, values.position.latitude],
          zoom: 12.8,
          duration: 900,
        })
      }

      return next
    })
  }

  const handleDeleteLocation = (locationId: string) => {
    setLocations((prev) => prev.filter((l) => l.id !== locationId))
    setHoveredLocationId((prev) => (prev === locationId ? null : prev))
    setSelectedLocationId((prev) => (prev === locationId ? null : prev))
  }

  const handleCreateLocation = (values: LocationCreateValues) => {
    const id = nextId("location")
    const location: Location = {
      id,
      name: values.name,
      typeId: values.typeId,
      address: values.address,
      city: values.city,
      position: values.position,
      rooms: [],
    }
    setLocations((prev) => [location, ...prev])
    setSelectedLocationId(id)
    mapRef.current?.flyTo({
      center: [values.position.longitude, values.position.latitude],
      zoom: 12.8,
      duration: 900,
    })
  }

  return (
    <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1fr_360px]">
      <div className="relative min-h-[60svh] overflow-hidden rounded-xl border">
        {selectedLocation ? (
          <LocationsDetailCard
            location={selectedLocation}
            onClose={handleCloseDetail}
            onAddRoom={handleAddRoom}
            onRemoveRoom={handleRemoveRoom}
            onUpdateRoomCapacity={handleUpdateRoomCapacity}
            onUpdateLocation={handleUpdateLocation}
            onDeleteLocation={handleDeleteLocation}
            locationTypes={types}
            locationTypeById={typeById}
            onAddLocationType={addType}
            onRemoveLocationType={removeType}
            onRenameLocationType={updateTypeLabel}
            usageCountByTypeId={usageCountByTypeId}
          />
        ) : (
          <div className="pointer-events-none absolute top-3 left-3 z-10">
            <Badge variant="outline">Clique un marker pour zoomer</Badge>
          </div>
        )}

        <Map ref={mapRef} className="h-full" {...defaultViewport}>
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
              onClick={() => handleSelectLocation(location.id)}
              >
              <MarkerContent className="group">
                <div className="relative -translate-y-2">
                  <div
                    className={[
                      "flex h-8 w-8 items-center justify-center rounded-full border shadow-md transition-transform",
                      markerColor(location.typeId),
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
                        isSelected || isHovered
                          ? "border-ring"
                          : "border-border",
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
      </div>

      <div className="min-h-0">
        <LocationsListPanel
          locations={locations}
          selectedLocationId={selectedLocationId}
          onSelectLocation={handleSelectLocation}
          onCreateLocation={() => setCreateOpen(true)}
          onHoverLocationIdChange={setHoveredLocationId}
          locationTypeById={typeById}
        />
      </div>

      <LocationCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={handleCreateLocation}
        locationTypes={types}
        onAddLocationType={addType}
        onRemoveLocationType={removeType}
        onRenameLocationType={updateTypeLabel}
        usageCountByTypeId={usageCountByTypeId}
      />
    </div>
  )
}

