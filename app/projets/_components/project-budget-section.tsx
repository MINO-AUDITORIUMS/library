"use client"

import { useMemo, useState } from "react"
import { PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatEur } from "@/lib/format/money"
import type {
  BudgetCategory,
  ProjectBudget,
} from "@/lib/projects/finance-types"

export type ProjectBudgetSectionProps = {
  projectId: string
  initialBudget: ProjectBudget
  categories: BudgetCategory[]
  onBudgetChange: (budget: ProjectBudget) => void
}

type MoneyInputProps = {
  value: number
  ariaLabel: string
  onCommit: (value: number) => void
}

function MoneyInput({ value, ariaLabel, onCommit }: MoneyInputProps) {
  const [draft, setDraft] = useState<string | null>(null)
  const display = draft ?? String(value)

  return (
    <Input
      type="text"
      inputMode="decimal"
      value={display}
      aria-label={ariaLabel}
      onFocus={(e) => {
        setDraft(String(value))
        e.currentTarget.select()
      }}
      onChange={(e) => {
        const raw = e.target.value.replace(",", ".")
        if (raw === "" || raw === "." || /^\d*\.?\d*$/.test(raw)) {
          setDraft(raw)
        }
      }}
      onBlur={() => {
        const raw = (draft ?? String(value)).trim()
        const next = raw === "" || raw === "." ? 0 : Number(raw)
        setDraft(null)
        if (!Number.isFinite(next)) return
        const normalized = Math.max(0, next)
        if (normalized !== value) onCommit(normalized)
      }}
    />
  )
}

export function ProjectBudgetSection({
  projectId,
  initialBudget,
  categories,
  onBudgetChange,
}: ProjectBudgetSectionProps) {
  const [budget, setBudget] = useState(initialBudget)
  const [categoryId, setCategoryId] = useState("")
  const [busy, setBusy] = useState(false)

  const availableCategories = useMemo(() => {
    const used = new Set(budget.lines.map((line) => line.categoryId))
    return categories.filter((c) => c.isActive && !used.has(c.id))
  }, [budget.lines, categories])

  const applyBudget = (next: ProjectBudget) => {
    setBudget(next)
    onBudgetChange(next)
  }

  const addLine = async () => {
    if (!categoryId) return
    setBusy(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/budget`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, budgetedAmount: 0, engagedAmount: 0 }),
      })
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string
        } | null
        throw new Error(body?.error ?? "Impossible d’ajouter la ligne.")
      }
      const body = (await response.json()) as { budget: ProjectBudget }
      if (body.budget) applyBudget(body.budget)
      setCategoryId("")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Impossible d’ajouter la ligne."
      )
    } finally {
      setBusy(false)
    }
  }

  const patchLine = async (
    lineId: string,
    patch: { budgetedAmount?: number; engagedAmount?: number }
  ) => {
    setBudget((current) => ({
      ...current,
      lines: current.lines.map((item) =>
        item.id === lineId ? { ...item, ...patch } : item
      ),
    }))

    try {
      const response = await fetch(
        `/api/projects/${projectId}/budget/lines/${lineId}`,
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
      const body = (await response.json()) as { budget: ProjectBudget }
      if (body.budget) applyBudget(body.budget)
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
        `/api/projects/${projectId}/budget/lines/${lineId}`,
        { method: "DELETE" }
      )
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string
        } | null
        throw new Error(body?.error ?? "Impossible de supprimer la ligne.")
      }
      const body = (await response.json()) as { budget: ProjectBudget | null }
      if (body.budget) applyBudget(body.budget)
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
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base">Budget</CardTitle>
        <div className="text-sm text-muted-foreground">
          {formatEur(budget.budgetedTotal)} budgété ·{" "}
          {formatEur(budget.engagedTotal)} engagé
        </div>
      </CardHeader>
      <CardContent className="grid gap-3">
        {budget.lines.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune ligne budgétaire. Ajoute une catégorie pour démarrer.
          </p>
        ) : (
          <div className="grid gap-2">
            {budget.lines.map((line) => (
              <div
                key={line.id}
                className="grid gap-2 rounded-lg border px-3 py-2 sm:grid-cols-[1fr_7rem_7rem_auto] sm:items-center"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {line.categoryLabel}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Restant{" "}
                    {formatEur(line.budgetedAmount - line.engagedAmount)}
                  </div>
                </div>
                <MoneyInput
                  value={line.budgetedAmount}
                  ariaLabel={`Budgeté ${line.categoryLabel}`}
                  onCommit={(value) =>
                    void patchLine(line.id, { budgetedAmount: value })
                  }
                />
                <MoneyInput
                  value={line.engagedAmount}
                  ariaLabel={`Engagé ${line.categoryLabel}`}
                  onCommit={(value) =>
                    void patchLine(line.id, { engagedAmount: value })
                  }
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => void removeLine(line.id)}
                  aria-label="Supprimer la ligne"
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="w-full sm:max-w-xs">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent position="popper" align="start">
              {availableCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="secondary"
            disabled={!categoryId || busy || availableCategories.length === 0}
            onClick={() => void addLine()}
          >
            <PlusIcon className="mr-1 h-4 w-4" />
            Ajouter une ligne
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
