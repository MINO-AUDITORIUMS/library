"use client"

import { useCallback, useEffect, useState } from "react"
import { Disc3Icon, Mic2Icon, SearchIcon } from "lucide-react"
import { useRouter } from "next/navigation"

import { AlbumCover } from "@/components/catalog/album-cover"
import { ArtistAvatar } from "@/components/catalog/artist-avatar"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import type { AlbumSummary, ArtistSummary } from "@/lib/catalog/types"
import { albumDetailRoute, artistDetailRoute } from "@/lib/routes"

type SearchResults = {
  artists: ArtistSummary[]
  albums: AlbumSummary[]
}

const emptyResults: SearchResults = { artists: [], albums: [] }

function SearchKeyboardHint() {
  const [modifier, setModifier] = useState("Ctrl")

  useEffect(() => {
    setModifier(/Mac|iPod|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl")
  }, [])

  return (
    <kbd className="pointer-events-none ml-auto hidden h-5 shrink-0 items-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
      {modifier}K
    </kbd>
  )
}

export function GlobalSearchCommand() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResults>(emptyResults)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((current) => !current)
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  useEffect(() => {
    if (!open) {
      setQuery("")
      setResults(emptyResults)
      setLoading(false)
    }
  }, [open])

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setResults(emptyResults)
      setLoading(false)
      return
    }

    setLoading(true)
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        )
        if (!response.ok) {
          setResults(emptyResults)
          return
        }
        const data = (await response.json()) as SearchResults
        setResults(data)
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return
        }
        setResults(emptyResults)
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [query])

  const navigate = useCallback(
    (href: string) => {
      setOpen(false)
      router.push(href)
    },
    [router]
  )

  const trimmedQuery = query.trim()
  const hasResults = results.artists.length > 0 || results.albums.length > 0
  const showPrompt = trimmedQuery.length < 2
  const showEmpty = !showPrompt && !loading && !hasResults

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="hidden h-8 w-52 justify-start gap-2 text-muted-foreground md:inline-flex"
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="size-3.5 shrink-0" />
        <span className="flex-1 truncate text-left">Rechercher…</span>
        <SearchKeyboardHint />
      </Button>
      <Button
        variant="outline"
        size="icon-sm"
        className="md:hidden"
        aria-label="Rechercher"
        onClick={() => setOpen(true)}
      >
        <SearchIcon />
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        shouldFilter={false}
        className="max-w-xl"
      >
        <CommandInput
          placeholder="Rechercher un artiste, un album ou un label…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {showPrompt ? (
            <CommandEmpty>Saisissez au moins 2 caractères.</CommandEmpty>
          ) : loading ? (
            <CommandEmpty>Recherche…</CommandEmpty>
          ) : showEmpty ? (
            <CommandEmpty>
              Aucun résultat pour « {trimmedQuery} ».
            </CommandEmpty>
          ) : (
            <>
              {results.artists.length > 0 ? (
                <CommandGroup heading="Artistes">
                  {results.artists.map((artist) => (
                    <CommandItem
                      key={artist.id}
                      value={`artist-${artist.id}-${artist.name}`}
                      onSelect={() => navigate(artistDetailRoute(artist.id))}
                    >
                      <ArtistAvatar
                        name={artist.name}
                        hue={artist.coverHue}
                        imageUrl={artist.imageUrl}
                        size="sm"
                        className="size-8 [&_svg]:size-3.5"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{artist.name}</p>
                        {artist.country ? (
                          <p className="truncate text-xs text-muted-foreground">
                            {artist.country}
                          </p>
                        ) : null}
                      </div>
                      <Mic2Icon className="size-3.5 text-muted-foreground" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : null}
              {results.artists.length > 0 && results.albums.length > 0 ? (
                <CommandSeparator />
              ) : null}
              {results.albums.length > 0 ? (
                <CommandGroup heading="Albums">
                  {results.albums.map((album) => (
                    <CommandItem
                      key={album.id}
                      value={`album-${album.id}-${album.title}-${album.artist}`}
                      onSelect={() => navigate(albumDetailRoute(album.id))}
                    >
                      <AlbumCover
                        title={album.title}
                        hue={album.coverHue}
                        imageUrl={album.coverImageUrl}
                        size="sm"
                        className="size-8 rounded-sm [&_svg]:size-3.5"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{album.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {album.artist}
                          {album.releaseYear > 0 ? ` · ${album.releaseYear}` : ""}
                          {album.label && album.label !== "—"
                            ? ` · ${album.label}`
                            : ""}
                        </p>
                      </div>
                      <Disc3Icon className="size-3.5 text-muted-foreground" />
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : null}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
