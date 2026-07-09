"use client"

import { Building2Icon, MapPinIcon, UsersIcon } from "lucide-react"

import type {
  Location,
  LocationRoom,
} from "@/app/lieux/_components/mock-locations"
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
}

function kindLabel(kind: Location["kind"]) {
  switch (kind) {
    case "mino-venue":
      return "Salle MINO"
    case "cinema":
      return "Cinéma"
    case "outdoor":
      return "Plein air"
    case "other":
      return "Autre"
  }
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
}: LocationsDetailCardProps) {
  const totalCapacity = roomsCapacitySummary(location.rooms)

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
                  {kindLabel(location.kind)}
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
    </div>
  )
}

