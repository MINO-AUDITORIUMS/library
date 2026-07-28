"use client"

import { useMemo, useState } from "react"

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
import type { Location, LocationType } from "@/lib/locations/types"

export type LocationEditValues = Pick<
  Location,
  "name" | "typeId" | "address" | "city" | "position"
>

export type LocationEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  location: Location
  onSave: (values: LocationEditValues) => void | Promise<void>
  locationTypes: LocationType[]
  onAddLocationType: (label: string) => Promise<string | null>
  onRemoveLocationType: (id: string) => void | Promise<void>
  onRenameLocationType: (id: string, label: string) => void | Promise<void>
  usageCountByTypeId?: Record<string, number>
}

function fallbackTypeId(types: LocationType[], current: string) {
  if (types.some((t) => t.id === current)) return current
  return types.find((t) => t.code === "other")?.id ?? types[0]?.id ?? current
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
  const [typeId, setTypeId] = useState(
    fallbackTypeId(locationTypes, location.typeId)
  )
  const [address, setAddress] = useState(location.address)
  const [city, setCity] = useState(location.city)
  const [position, setPosition] = useState(location.position)
  const [addressQuery, setAddressQuery] = useState(location.address)
  const [typeManagerOpen, setTypeManagerOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const canSave = useMemo(() => {
    if (!name.trim()) return false
    if (!address.trim()) return false
    if (!typeId) return false
    return true
  }, [address, name, typeId])

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier un lieu</DialogTitle>
            <DialogDescription>
              Modifie les informations du lieu.
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
                      {t.label}
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
              disabled={!canSave || saving}
              onClick={() => {
                void (async () => {
                  setSaving(true)
                  try {
                    await onSave({
                      name: name.trim(),
                      typeId,
                      address: address.trim(),
                      city: city.trim(),
                      position,
                    })
                    onOpenChange(false)
                  } catch {
                    setSaving(false)
                  }
                })()
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
        onAddType={async (label) => {
          const id = await onAddLocationType(label)
          if (id) setTypeId(id)
          return id
        }}
        onRenameType={onRenameLocationType}
        onDeleteType={async (id) => {
          await onRemoveLocationType(id)
          if (typeId === id) {
            setTypeId(fallbackTypeId(locationTypes, location.typeId))
          }
        }}
      />
    </>
  )
}
