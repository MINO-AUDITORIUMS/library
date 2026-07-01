"use client"

import { XIcon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import { FeaturingArtistSuggestions } from "@/components/catalog/featuring-artist-suggestions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { FeatArtistSearchHit } from "@/lib/catalog/feat-artist-search-hit"
import { uniqueCreditNames } from "@/lib/catalog/track-credits"
import { cn } from "@/lib/utils"

export type FeaturingArtistFieldProps = {
  value: string[]
  onChange: (names: string[]) => void
  disabled?: boolean
}

function removeName(names: string[], name: string) {
  const key = name.trim().toLowerCase()
  return names.filter((entry) => entry.trim().toLowerCase() !== key)
}

function hasName(names: string[], name: string) {
  const key = name.trim().toLowerCase()
  return names.some((entry) => entry.trim().toLowerCase() === key)
}

export function FeaturingArtistField({
  value,
  onChange,
  disabled = false,
}: FeaturingArtistFieldProps) {
  const [draft, setDraft] = useState("")
  const [suggestions, setSuggestions] = useState<FeatArtistSearchHit[]>([])
  const [loading, setLoading] = useState(false)

  const loadSuggestions = useCallback(
    async (query: string, signal: AbortSignal) => {
      const trimmed = query.trim()
      if (trimmed.length < 2) {
        setSuggestions([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const response = await fetch(
          `/api/catalog/artists/search?q=${encodeURIComponent(trimmed)}`,
          { signal }
        )
        const data = (await response.json()) as {
          results?: FeatArtistSearchHit[]
          error?: string
        }

        if (!response.ok) {
          setSuggestions([])
          return
        }

        setSuggestions(
          (data.results ?? []).filter((hit) => !hasName(value, hit.name))
        )
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    },
    [value]
  )

  useEffect(() => {
    const trimmed = draft.trim()
    if (trimmed.length < 2) {
      setSuggestions([])
      setLoading(false)
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      void loadSuggestions(trimmed, controller.signal)
    }, 300)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [draft, loadSuggestions])

  function addName(name: string) {
    const trimmed = name.trim()
    if (!trimmed || hasName(value, trimmed)) return
    onChange(uniqueCreditNames([...value, trimmed]))
    setDraft("")
    setSuggestions([])
  }

  function selectHit(hit: FeatArtistSearchHit) {
    addName(hit.name)
  }

  function commitDraft() {
    const trimmed = draft.trim()
    if (!trimmed) return

    const exact = suggestions.find(
      (hit) => hit.name.toLowerCase() === trimmed.toLowerCase()
    )
    if (exact) {
      selectHit(exact)
      return
    }

    if (suggestions.length > 0) {
      selectHit(suggestions[0])
      return
    }

    addName(trimmed)
  }

  return (
    <div
      className={cn(
        "min-w-0 space-y-2 rounded-md border border-primary/25 bg-primary/5 p-2.5"
      )}
    >
      <div>
        <Label className="text-xs text-muted-foreground">Feat.</Label>
      </div>

      {value.length > 0 ? (
        <div className="flex min-w-0 flex-wrap gap-1.5">
          {value.map((name) => (
            <Badge
              key={name}
              variant="default"
              className="h-auto max-w-full gap-1 py-1 pr-1 break-words whitespace-normal"
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
        placeholder="Rechercher un artiste…"
        disabled={disabled}
        autoComplete="off"
      />

      <FeaturingArtistSuggestions
        suggestions={suggestions}
        loading={loading}
        query={draft}
        disabled={disabled}
        onSelect={selectHit}
      />
    </div>
  )
}
