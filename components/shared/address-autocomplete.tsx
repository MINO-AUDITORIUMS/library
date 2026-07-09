"use client"

import { Loader2Icon, MapPinIcon } from "lucide-react"
import { useMemo, useRef, useState } from "react"

import { Command, CommandItem, CommandList } from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export type AddressAutocompleteResult = {
  label: string
  city: string | null
  lat: number
  lng: number
}

export type AddressAutocompleteProps = {
  id?: string
  value: string
  placeholder?: string
  minChars?: number
  onValueChange: (value: string) => void
  onSelect: (result: AddressAutocompleteResult) => void
}

type AddressSuggestion = {
  id: string
  label: string
  address: string
  city: string
  coordinates: [number, number]
}

async function fetchFrenchAddressSuggestions(
  query: string,
  signal: AbortSignal,
): Promise<AddressSuggestion[]> {
  const url = new URL("https://api-adresse.data.gouv.fr/search/")
  url.searchParams.set("q", query)
  url.searchParams.set("limit", "6")
  url.searchParams.set("type", "housenumber")

  const res = await fetch(url.toString(), { signal })
  if (!res.ok) return []
  const data = (await res.json()) as {
    features?: Array<{
      geometry?: { coordinates?: [number, number] }
      properties?: {
        id?: string
        label?: string
        name?: string
        city?: string
      }
    }>
  }

  const features = data.features ?? []
  return features
    .map((f) => {
      const id = f.properties?.id
      const label = f.properties?.label
      const address = f.properties?.name
      const city = f.properties?.city
      const coordinates = f.geometry?.coordinates
      if (!id || !label || !address || !city || !coordinates) return null
      return { id, label, address, city, coordinates }
    })
    .filter((x): x is AddressSuggestion => x != null)
}

export function AddressAutocomplete({
  id,
  value,
  placeholder = "Rechercher une adresse…",
  minChars = 2,
  onValueChange,
  onSelect,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const abortRef = useRef<AbortController | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showNoResults = useMemo(() => {
    return hasSearched && !loading && value.trim().length >= minChars && !suggestions.length
  }, [hasSearched, loading, minChars, suggestions.length, value])

  const handleChange = (nextValue: string) => {
    onValueChange(nextValue)

    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }

    const q = nextValue.trim()
    if (q.length < minChars) {
      setSuggestions([])
      setLoading(false)
      setOpen(false)
      setHasSearched(false)
      return
    }

    setHasSearched(true)
    setLoading(true)
    timerRef.current = setTimeout(async () => {
      const controller = new AbortController()
      abortRef.current = controller
      try {
        const items = await fetchFrenchAddressSuggestions(q, controller.signal)
        setSuggestions(items)
        setOpen(items.length > 0)
      } catch {
        setSuggestions([])
        setOpen(false)
      } finally {
        setLoading(false)
      }
    }, 250)
  }

  const handlePick = (s: AddressSuggestion) => {
    onValueChange(s.label)
    onSelect({
      label: s.label,
      city: s.city || null,
      lat: s.coordinates[1],
      lng: s.coordinates[0],
    })
    setSuggestions([])
    setOpen(false)
    setHasSearched(false)
  }

  return (
    <div className="space-y-1.5">
      <Popover open={open && suggestions.length > 0} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              id={id}
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              onFocus={() => {
                if (suggestions.length) setOpen(true)
              }}
              placeholder={placeholder}
              className={loading ? "pr-8" : undefined}
            />
            {loading ? (
              <Loader2Icon className="pointer-events-none absolute top-2 right-2 h-4 w-4 animate-spin text-muted-foreground" />
            ) : null}
          </div>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-(--radix-popover-trigger-width) p-1"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <Command shouldFilter={false}>
            <CommandList>
              {suggestions.map((s) => (
                <CommandItem
                  key={s.id}
                  value={s.label}
                  onSelect={() => handlePick(s)}
                  className="gap-2"
                >
                  <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{s.label}</div>
                  </div>
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {showNoResults ? (
        <div className="text-xs text-muted-foreground">Aucun résultat</div>
      ) : null}
    </div>
  )
}

