"use client"

import { useState } from "react"
import { PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import type { ProjectLocationOption } from "@/app/projets/_components/project-create-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatEur } from "@/lib/format/money"
import type { ProjectTicketLine } from "@/lib/projects/finance-types"

const VAT_OPTIONS = [0, 5.5, 10, 20]

export type ProjectTicketsSectionProps = {
  projectId: string
  initialLines: ProjectTicketLine[]
  locations: ProjectLocationOption[]
  onLinesChange: (lines: ProjectTicketLine[]) => void
}

export function ProjectTicketsSection({
  projectId,
  initialLines,
  locations,
  onLinesChange,
}: ProjectTicketsSectionProps) {
  const [lines, setLines] = useState(initialLines)
  const [locationId, setLocationId] = useState("")
  const [busy, setBusy] = useState(false)

  const addLine = async () => {
    if (!locationId) return
    setBusy(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locationId }),
      })
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string
        } | null
        throw new Error(body?.error ?? "Impossible d’ajouter le lieu.")
      }
      const body = (await response.json()) as { line: ProjectTicketLine }
      setLines((current) => {
        const next = [...current, body.line]
        onLinesChange(next)
        return next
      })
      setLocationId("")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Impossible d’ajouter le lieu."
      )
    } finally {
      setBusy(false)
    }
  }

  const patchLine = async (
    lineId: string,
    patch: Record<string, number | boolean | string>
  ) => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/tickets/${lineId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        }
      )
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string
        } | null
        throw new Error(body?.error ?? "Impossible de modifier la ligne.")
      }
      const body = (await response.json()) as { line: ProjectTicketLine }
      setLines((current) => {
        const next = current.map((line) =>
          line.id === lineId ? body.line : line
        )
        onLinesChange(next)
        return next
      })
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de modifier la ligne."
      )
    }
  }

  const removeLine = async (lineId: string) => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/tickets/${lineId}`,
        { method: "DELETE" }
      )
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string
        } | null
        throw new Error(body?.error ?? "Impossible de supprimer la ligne.")
      }
      setLines((current) => {
        const next = current.filter((line) => line.id !== lineId)
        onLinesChange(next)
        return next
      })
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de supprimer la ligne."
      )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Billetterie / Distribution</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {lines.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun lieu de diffusion. Ajoute un lieu pour calculer capacités et
            revenus.
          </p>
        ) : (
          <div className="grid gap-3">
            {lines.map((line) => (
              <div key={line.id} className="grid gap-3 rounded-lg border p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium">{line.locationName}</div>
                    <div className="text-xs text-muted-foreground">
                      {line.locationCity || "—"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {line.isFree ? <Badge variant="outline">Gratuit</Badge> : null}
                    <Badge variant="muted">{line.fillRate}% fill</Badge>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => void removeLine(line.id)}
                      aria-label="Retirer le lieu"
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <NumberField
                    label="Cap / séance"
                    value={line.capacityPerScreening}
                    onCommit={(value) =>
                      void patchLine(line.id, { capacityPerScreening: value })
                    }
                  />
                  <NumberField
                    label="Séances"
                    value={line.screenings}
                    min={1}
                    onCommit={(value) =>
                      void patchLine(line.id, { screenings: value })
                    }
                  />
                  <NumberField
                    label="Invitations"
                    value={line.invitations}
                    onCommit={(value) =>
                      void patchLine(line.id, { invitations: value })
                    }
                  />
                  <NumberField
                    label="Billets vendus"
                    value={line.ticketsSold}
                    onCommit={(value) =>
                      void patchLine(line.id, { ticketsSold: value })
                    }
                  />
                </div>

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="grid gap-1.5">
                    <Label>Prix TTC</Label>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      disabled={line.isFree}
                      defaultValue={line.ticketPriceTtc}
                      onBlur={(e) => {
                        const value = Number(e.target.value)
                        if (!Number.isFinite(value)) return
                        void patchLine(line.id, {
                          ticketPriceTtc: Math.max(0, value),
                        })
                      }}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>TVA</Label>
                    <Select
                      value={String(line.vatRate)}
                      onValueChange={(value) =>
                        void patchLine(line.id, { vatRate: Number(value) })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position="popper" align="start">
                        {VAT_OPTIONS.map((rate) => (
                          <SelectItem key={rate} value={String(rate)}>
                            {rate} %
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Tarification</Label>
                    <Button
                      type="button"
                      variant={line.isFree ? "secondary" : "outline"}
                      onClick={() =>
                        void patchLine(line.id, { isFree: !line.isFree })
                      }
                    >
                      {line.isFree ? "Événement gratuit" : "Payant"}
                    </Button>
                  </div>
                </div>

                <div className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
                  <div>Capacité totale : {line.totalCapacity}</div>
                  <div>En vente : {line.ticketsOnSale}</div>
                  <div>Prix HT : {formatEur(line.ticketPriceHt)}</div>
                  <div>
                    Revenu HT : {formatEur(line.actualRevenueHt)} / pot.{" "}
                    {formatEur(line.potentialRevenueHt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={locationId} onValueChange={setLocationId}>
            <SelectTrigger className="w-full sm:max-w-xs">
              <SelectValue placeholder="Lieu" />
            </SelectTrigger>
            <SelectContent position="popper" align="start">
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                  {location.city ? ` · ${location.city}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="secondary"
            disabled={!locationId || busy || locations.length === 0}
            onClick={() => void addLine()}
          >
            <PlusIcon className="mr-1 h-4 w-4" />
            Ajouter un lieu
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

type NumberFieldProps = {
  label: string
  value: number
  min?: number
  onCommit: (value: number) => void
}

function NumberField({ label, value, min = 0, onCommit }: NumberFieldProps) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      <Input
        type="number"
        min={min}
        defaultValue={value}
        onBlur={(e) => {
          const next = Number(e.target.value)
          if (!Number.isFinite(next)) return
          onCommit(Math.max(min, Math.floor(next)))
        }}
      />
    </div>
  )
}
