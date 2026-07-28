"use client"

import { useMemo, useRef, useState } from "react"
import { toast } from "sonner"

import {
  LocationCreateDialog,
  type LocationCreateValues,
} from "@/app/lieux/_components/location-create-dialog"
import type { LocationEditValues } from "@/app/lieux/_components/location-edit-dialog"
import { LocationsDetailCard } from "@/app/lieux/_components/locations-detail-card"
import { LocationsListPanel } from "@/app/lieux/_components/locations-list-panel"
import { LocationsMap } from "@/app/lieux/_components/locations-map"
import type { MapRef } from "@/components/ui/map"
import { useLocations } from "@/hooks/use-locations"
import type { Location, LocationType } from "@/lib/locations/types"

export type LocationsPageClientProps = {
  initialLocations: Location[]
  initialTypes: LocationType[]
}

export function LocationsPageClient({
  initialLocations,
  initialTypes,
}: LocationsPageClientProps) {
  const mapRef = useRef<MapRef | null>(null)
  const {
    locations,
    types,
    typeById,
    usageCountByTypeId,
    createLocation,
    updateLocation,
    deleteLocation,
    addRoom,
    removeRoom,
    updateRoomCapacity,
    addType,
    removeType,
    updateTypeLabel,
  } = useLocations({ initialLocations, initialTypes })

  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null
  )
  const [hoveredLocationId, setHoveredLocationId] = useState<string | null>(
    null
  )
  const [createOpen, setCreateOpen] = useState(false)

  const locationsById = useMemo(
    () =>
      Object.fromEntries(locations.map((l) => [l.id, l])) as Record<
        string,
        Location
      >,
    [locations]
  )

  const selectedLocation = selectedLocationId
    ? locationsById[selectedLocationId]
    : null

  const flyToLocation = (location: Location) => {
    mapRef.current?.flyTo({
      center: [location.position.longitude, location.position.latitude],
      zoom: 12.8,
      duration: 900,
    })
  }

  const handleSelectLocation = (locationId: string) => {
    setSelectedLocationId(locationId)
    const location = locationsById[locationId]
    if (location) flyToLocation(location)
  }

  const handleCreateLocation = async (values: LocationCreateValues) => {
    try {
      const location = await createLocation({
        name: values.name,
        typeId: values.typeId,
        address: values.address,
        city: values.city,
        longitude: values.position.longitude,
        latitude: values.position.latitude,
      })
      setSelectedLocationId(location.id)
      flyToLocation(location)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Impossible de créer le lieu."
      )
      throw error
    }
  }

  const handleUpdateLocation = async (
    locationId: string,
    values: LocationEditValues
  ) => {
    try {
      const location = await updateLocation(locationId, {
        name: values.name,
        typeId: values.typeId,
        address: values.address,
        city: values.city,
        longitude: values.position.longitude,
        latitude: values.position.latitude,
      })
      if (selectedLocationId === locationId) flyToLocation(location)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de modifier le lieu."
      )
      throw error
    }
  }

  const handleDeleteLocation = async (locationId: string) => {
    try {
      await deleteLocation(locationId)
      setHoveredLocationId((prev) => (prev === locationId ? null : prev))
      setSelectedLocationId((prev) => (prev === locationId ? null : prev))
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de supprimer le lieu."
      )
      throw error
    }
  }

  const handleAddRoom = async (locationId: string) => {
    try {
      await addRoom(locationId)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible d’ajouter une salle."
      )
    }
  }

  const handleRemoveRoom = async (locationId: string, roomId: string) => {
    try {
      await removeRoom(locationId, roomId)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de retirer la salle."
      )
    }
  }

  const handleAddType = async (label: string) => {
    try {
      return await addType(label)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Impossible d’ajouter le type."
      )
      return null
    }
  }

  const handleRemoveType = async (id: string) => {
    try {
      await removeType(id)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de supprimer le type."
      )
      throw error
    }
  }

  const handleRenameType = async (id: string, label: string) => {
    try {
      await updateTypeLabel(id, label)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de renommer le type."
      )
      throw error
    }
  }

  return (
    <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1fr_360px]">
      <div className="relative min-h-[60svh] overflow-hidden rounded-xl border">
        {selectedLocation ? (
          <LocationsDetailCard
            location={selectedLocation}
            onClose={() => setSelectedLocationId(null)}
            onAddRoom={handleAddRoom}
            onRemoveRoom={handleRemoveRoom}
            onUpdateRoomCapacity={updateRoomCapacity}
            onUpdateLocation={handleUpdateLocation}
            onDeleteLocation={handleDeleteLocation}
            locationTypes={types}
            locationTypeById={typeById}
            onAddLocationType={handleAddType}
            onRemoveLocationType={handleRemoveType}
            onRenameLocationType={handleRenameType}
            usageCountByTypeId={usageCountByTypeId}
          />
        ) : null}

        <LocationsMap
          mapRef={mapRef}
          locations={locations}
          selectedLocationId={selectedLocationId}
          hoveredLocationId={hoveredLocationId}
          onSelectLocation={handleSelectLocation}
        />
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
        onAddLocationType={handleAddType}
        onRemoveLocationType={handleRemoveType}
        onRenameLocationType={handleRenameType}
        usageCountByTypeId={usageCountByTypeId}
      />
    </div>
  )
}
