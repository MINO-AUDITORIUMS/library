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

export type LocationCreateValues = Pick<
  Location,
  "name" | "typeId" | "address" | "city"
> & {
  position: Location["position"]
}

export type LocationCreateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (values: LocationCreateValues) => void | Promise<void>
  locationTypes: LocationType[]
  onAddLocationType: (label: string) => Promise<string | null>
  onRemoveLocationType: (id: string) => void | Promise<void>
  onRenameLocationType: (id: string, label: string) => void | Promise<void>
  usageCountByTypeId?: Record<string, number>
}

function defaultTypeId(types: LocationType[]) {
  return (
    types.find((t) => t.code === "other")?.id ?? types[0]?.id ?? ""
  )
}

export function LocationCreateDialog({
  open,
  onOpenChange,
  onCreate,
  locationTypes,
  onAddLocationType,
  onRemoveLocationType,
  onRenameLocationType,
  usageCountByTypeId,
}: LocationCreateDialogProps) {
  const fallbackTypeId = defaultTypeId(locationTypes)
  const [name, setName] = useState("")
  const [typeId, setTypeId] = useState(fallbackTypeId)
  const [typeManagerOpen, setTypeManagerOpen] = useState(false)
  const [addressQuery, setAddressQuery] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [position, setPosition] = useState<Location["position"]>({
    longitude: 2.2137,
    latitude: 46.2276,
  })
  const [saving, setSaving] = useState(false)

  const resolvedTypeId = typeId || fallbackTypeId

  const canCreate = useMemo(() => {
    if (!name.trim()) return false
    if (!address.trim()) return false
    if (!city.trim()) return false
    if (!resolvedTypeId) return false
    return true
  }, [address, city, name, resolvedTypeId])

  const reset = () => {
    setName("")
    setTypeId(defaultTypeId(locationTypes))
    setTypeManagerOpen(false)
    setAddressQuery("")
    setAddress("")
    setCity("")
    setPosition({ longitude: 2.2137, latitude: 46.2276 })
    setSaving(false)
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          onOpenChange(next)
          if (!next) reset()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau lieu</DialogTitle>
            <DialogDescription>
              Tape une adresse, sélectionne une suggestion, et le lieu se remplit
              automatiquement.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <div className="text-sm font-medium">Nom</div>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Cinéma Utopia"
              />
            </div>

            <div className="grid gap-1.5">
              <div className="text-sm font-medium">Type</div>
              <Select
                value={resolvedTypeId}
                onValueChange={(v) => setTypeId(v)}
              >
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
              disabled={!canCreate || saving}
              onClick={() => {
                void (async () => {
                  setSaving(true)
                  try {
                    await onCreate({
                      name: name.trim(),
                      typeId: resolvedTypeId,
                      address: address.trim(),
                      city: city.trim(),
                      position,
                    })
                    onOpenChange(false)
                    reset()
                  } catch {
                    setSaving(false)
                  }
                })()
              }}
            >
              Créer
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
          if (typeId === id) setTypeId(defaultTypeId(locationTypes))
        }}
      />
    </>
  )
}
