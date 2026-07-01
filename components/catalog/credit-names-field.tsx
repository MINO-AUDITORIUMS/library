"use client"

import { useState } from "react"
import { XIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { uniqueCreditNames } from "@/lib/catalog/track-credits"
import { cn } from "@/lib/utils"

export type CreditNamesFieldProps = {
  label: string
  hint?: string
  value: string[]
  onChange: (names: string[]) => void
  placeholder?: string
  disabled?: boolean
  highlighted?: boolean
}

function removeName(names: string[], name: string) {
  const key = name.trim().toLowerCase()
  return names.filter((entry) => entry.trim().toLowerCase() !== key)
}

export function CreditNamesField({
  label,
  hint,
  value,
  onChange,
  placeholder = "Nom puis Entrée",
  disabled = false,
  highlighted = false,
}: CreditNamesFieldProps) {
  const [draft, setDraft] = useState("")

  function commitDraft() {
    const trimmed = draft.trim()
    if (!trimmed) return
    const next = uniqueCreditNames([...value, trimmed])
    if (next.length !== value.length) onChange(next)
    setDraft("")
  }

  return (
    <div
      className={cn(
        "min-w-0 space-y-2",
        highlighted && "rounded-md border border-primary/25 bg-primary/5 p-2.5"
      )}
    >
      <div>
        <Label className="text-xs text-muted-foreground">{label}</Label>
        {hint ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>

      {value.length > 0 ? (
        <div className="flex min-w-0 flex-wrap gap-1.5">
          {value.map((name) => (
            <Badge
              key={name}
              variant={highlighted ? "default" : "secondary"}
              className="h-auto max-w-full gap-1 py-1 pr-1 whitespace-normal break-words"
            >
              {name}
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="size-5"
                disabled={disabled}
                aria-label={`Retirer ${name}`}
                onClick={() => onChange(removeName(value, name))}
              >
                <XIcon className="size-3" />
              </Button>
            </Badge>
          ))}
        </div>
      ) : null}

      <Input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== "Enter" || disabled) return
          event.preventDefault()
          commitDraft()
        }}
        onBlur={() => commitDraft()}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
      />
    </div>
  )
}
