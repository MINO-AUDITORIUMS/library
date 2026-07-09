"use client"

import { Building2Icon, MapPinIcon, PencilIcon, Trash2Icon, UsersIcon } from "lucide-react"
import { useState } from "react"

import type {
  Location,
  LocationRoom,
} from "@/app/lieux/_components/mock-locations"
import { LocationDeleteAlert } from "@/app/lieux/_components/location-delete-alert"
import {
  LocationEditDialog,
  type LocationEditValues,
} from "@/app/lieux/_components/location-edit-dialog"
import type { LocationType } from "@/app/lieux/_components/use-location-types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

export type LocationsDetailCardProps = {
  location: Location
  onClose: () => void
  onAddRoom: (locationId: string) => void
  onRemoveRoom: (locationId: string, roomId: string) => void
  onUpdateRoomCapacity: (
    locationId: string,
    roomId: string,
    capacity: number | null
  ) => void
  onUpdateLocation: (locationId: string, values: LocationEditValues) => void
  onDeleteLocation: (locationId: string) => void
  locationTypes: LocationType[]
  locationTypeById: Record<string, LocationType>
  onAddLocationType: (label: string) => string | null
  onRemoveLocationType: (id: string) => void
  onRenameLocationType: (id: string, label: string) => void
  usageCountByTypeId?: Record<string, number>
}

function typeLabel(typeId: string, typeById: Record<string, LocationType>) {
  return typeById[typeId]?.label ?? typeId
}

function roomsCapacitySummary(rooms: LocationRoom[]) {
  const capacities = rooms.map((r) => r.capacity).filter((c) => c != null)
  if (capacities.length === 0) return null
  return capacities.reduce((a, b) => a + b, 0)
}

export function LocationsDetailCard({
  location,
  onClose,
  onAddRoom,
  onRemoveRoom,
  onUpdateRoomCapacity,
  onUpdateLocation,
  onDeleteLocation,
  locationTypes,
  locationTypeById,
  onAddLocationType,
  onRemoveLocationType,
  onRenameLocationType,
  usageCountByTypeId,
}: LocationsDetailCardProps) {
  const totalCapacity = roomsCapacitySummary(location.rooms)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <div className="pointer-events-none absolute top-3 left-3 right-3 z-20 flex justify-center">
      <Card className="pointer-events-auto w-full max-w-2xl">
        <CardHeader className="gap-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="truncate">{location.name}</CardTitle>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Building2Icon className="h-4 w-4" />
                  {typeLabel(location.typeId, locationTypeById)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPinIcon className="h-4 w-4" />
                  {location.address}, {location.city}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {totalCapacity != null && (
                <Badge variant="muted" className="inline-flex items-center gap-1">
                  <UsersIcon className="h-3.5 w-3.5" />
                  {totalCapacity} places
                </Badge>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditOpen(true)}
              >
                <PencilIcon className="mr-1 h-4 w-4" />
                Modifier
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2Icon className="mr-1 h-4 w-4" />
                Supprimer
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                Fermer
              </Button>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="flex flex-col gap-3 pt-4">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-medium">Salles</div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onAddRoom(location.id)}
            >
              Ajouter une salle
            </Button>
          </div>

          <div className="grid gap-2">
            {location.rooms.map((room) => (
              <div
                key={room.id}
                className="flex flex-col gap-2 rounded-lg border bg-background px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{room.name}</div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-32">
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      placeholder="Capacité"
                      value={room.capacity ?? ""}
                      onChange={(e) => {
                        const raw = e.target.value.trim()
                        if (raw === "") {
                          onUpdateRoomCapacity(location.id, room.id, null)
                          return
                        }
                        const n = Number(raw)
                        if (!Number.isFinite(n)) return
                        onUpdateRoomCapacity(location.id, room.id, Math.max(0, Math.floor(n)))
                      }}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveRoom(location.id, room.id)}
                  >
                    Retirer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <LocationEditDialog
        key={`${location.id}-${editOpen ? "open" : "closed"}`}
        open={editOpen}
        onOpenChange={setEditOpen}
        location={location}
        onSave={(values) => onUpdateLocation(location.id, values)}
        locationTypes={locationTypes}
        onAddLocationType={onAddLocationType}
        onRemoveLocationType={onRemoveLocationType}
        onRenameLocationType={onRenameLocationType}
        usageCountByTypeId={usageCountByTypeId}
      />

      <LocationDeleteAlert
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        location={location}
        onConfirm={() => onDeleteLocation(location.id)}
      />
    </div>
  )
}

