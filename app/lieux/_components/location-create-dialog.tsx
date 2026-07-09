"use client"

import { useMemo, useState } from "react"

import type { Location } from "@/app/lieux/_components/mock-locations"
import type { LocationType } from "@/app/lieux/_components/use-location-types"
import { LocationTypeManagerDialog } from "@/app/lieux/_components/location-type-manager-dialog"
import { Button } from "@/components/ui/button"
import { AddressAutocomplete } from "@/components/shared/address-autocomplete"
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

export type LocationCreateValues = Pick<
  Location,
  "name" | "typeId" | "address" | "city"
> & {
  position: Location["position"]
}

export type LocationCreateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (values: LocationCreateValues) => void
  locationTypes: LocationType[]
  onAddLocationType: (label: string) => string | null
  onRemoveLocationType: (id: string) => void
  onRenameLocationType: (id: string, label: string) => void
  usageCountByTypeId?: Record<string, number>
}

function typeLabel(t: LocationType) {
  return t.label
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
  const [name, setName] = useState("")
  const [typeId, setTypeId] = useState("other")
  const [typeManagerOpen, setTypeManagerOpen] = useState(false)
  const [addressQuery, setAddressQuery] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [position, setPosition] = useState<Location["position"]>({
    longitude: 2.2137,
    latitude: 46.2276,
  })

  const canCreate = useMemo(() => {
    if (!name.trim()) return false
    if (!address.trim()) return false
    if (!city.trim()) return false
    return true
  }, [address, city, name])

  const reset = () => {
    setName("")
    setTypeId("other")
    setTypeManagerOpen(false)
    setAddressQuery("")
    setAddress("")
    setCity("")
    setPosition({ longitude: 2.2137, latitude: 46.2276 })
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
              automatiquement (mock).
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
            disabled={!canCreate}
            onClick={() => {
              onCreate({
                name: name.trim(),
                typeId,
                address: address.trim(),
                city: city.trim(),
                position,
              })
              onOpenChange(false)
              reset()
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

