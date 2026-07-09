"use client"

import { useMemo, useState } from "react"

import type { Location } from "@/app/lieux/_components/mock-locations"
import type { LocationType } from "@/app/lieux/_components/use-location-types"
import { LocationTypeManagerDialog } from "@/app/lieux/_components/location-type-manager-dialog"
import { AddressAutocomplete } from "@/components/shared/address-autocomplete"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type LocationEditValues = Pick<
  Location,
  "name" | "typeId" | "address" | "city" | "position"
>

export type LocationEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  location: Location
  onSave: (values: LocationEditValues) => void
  locationTypes: LocationType[]
  onAddLocationType: (label: string) => string | null
  onRemoveLocationType: (id: string) => void
  onRenameLocationType: (id: string, label: string) => void
  usageCountByTypeId?: Record<string, number>
}

function typeLabel(t: LocationType) {
  return t.label
}

export function LocationEditDialog({
  open,
  onOpenChange,
  location,
  onSave,
  locationTypes,
  onAddLocationType,
  onRemoveLocationType,
  onRenameLocationType,
  usageCountByTypeId,
}: LocationEditDialogProps) {
  const [name, setName] = useState(location.name)
  const [typeId, setTypeId] = useState(location.typeId)
  const [address, setAddress] = useState(location.address)
  const [city, setCity] = useState(location.city)
  const [position, setPosition] = useState(location.position)
  const [addressQuery, setAddressQuery] = useState(location.address)
  const [typeManagerOpen, setTypeManagerOpen] = useState(false)

  const canSave = useMemo(() => {
    if (!name.trim()) return false
    if (!address.trim()) return false
    return true
  }, [address, name])

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier un lieu</DialogTitle>
            <DialogDescription>
              Modifie les informations du lieu. Les changements sont en mock
              data.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <div className="text-sm font-medium">Nom</div>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="grid gap-1.5">
              <div className="text-sm font-medium">Type</div>
              <Select value={typeId} onValueChange={(v) => setTypeId(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent position="popper" align="start">
                  {locationTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {typeLabel(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                onClick={() => setTypeManagerOpen(true)}
              >
                Gérer les types
              </Button>
            </div>

            <div className="grid gap-1.5">
              <div className="text-sm font-medium">Adresse</div>
              <AddressAutocomplete
                value={addressQuery}
                onValueChange={setAddressQuery}
                placeholder="Rechercher une adresse…"
                onSelect={(result) => {
                  setAddress(result.label)
                  setCity(result.city ?? city)
                  setPosition({ longitude: result.lng, latitude: result.lat })
                }}
              />
              <div className="text-xs text-muted-foreground">
                Adresse retenue: {address && city ? `${address}, ${city}` : "—"}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button
              disabled={!canSave}
              onClick={() => {
                onSave({
                  name: name.trim(),
                  typeId,
                  address: address.trim(),
                  city: city.trim(),
                    position,
                })
                onOpenChange(false)
              }}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <LocationTypeManagerDialog
        open={typeManagerOpen}
        onOpenChange={setTypeManagerOpen}
        types={locationTypes}
        usageCountByTypeId={usageCountByTypeId}
        onAddType={(label) => {
          const id = onAddLocationType(label)
          if (id) setTypeId(id)
          return id
        }}
        onRenameType={onRenameLocationType}
        onDeleteType={(id) => {
          onRemoveLocationType(id)
          if (typeId === id) setTypeId("other")
        }}
      />
    </>
  )
}
