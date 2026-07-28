"use client"

import { useEffect, useState } from "react"
import { SearchIcon } from "lucide-react"

import { AlbumCover } from "@/components/catalog/album-cover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import type { ProgrammationAlbumRef } from "@/lib/programmation/types"

export type AlbumPickerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (album: ProgrammationAlbumRef) => void
  description?: string
}

export function AlbumPickerDialog({
  open,
  onOpenChange,
  onSelect,
  description = "Sélectionne un album du catalogue pour programmer une séance.",
}: AlbumPickerDialogProps) {
  const [query, setQuery] = useState("")
  const [albums, setAlbums] = useState<ProgrammationAlbumRef[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) {
      setQuery("")
      return
    }

    const controller = new AbortController()

    async function loadAlbums() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (query.trim().length >= 2) {
          params.set("q", query.trim())
        }

        const response = await fetch(
          `/api/programmation/albums?${params.toString()}`,
          { signal: controller.signal }
        )

        if (!response.ok) return

        const body = (await response.json()) as {
          albums: ProgrammationAlbumRef[]
        }
        setAlbums(body.albums)
      } catch {
        if (!controller.signal.aborted) {
          setAlbums([])
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    const timeout = window.setTimeout(loadAlbums, query.trim().length >= 2 ? 200 : 0)
    return () => {
      controller.abort()
      window.clearTimeout(timeout)
    }
  }, [open, query])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="px-4 pt-4">
          <DialogTitle>Choisir un album</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Rechercher un album…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList className="h-72">
            {loading ? (
              <div className="space-y-2 p-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : null}
            {!loading && albums.length === 0 ? (
              <CommandEmpty>Aucun album trouvé.</CommandEmpty>
            ) : null}
            {!loading && albums.length > 0 ? (
              <CommandGroup heading="Catalogue MINO">
                {albums.map((album) => (
                  <CommandItem
                    key={album.albumId}
                    value={album.albumId}
                    onSelect={() => {
                      onSelect(album)
                      onOpenChange(false)
                      setQuery("")
                    }}
                  >
                    <AlbumCover
                      title={album.title}
                      hue={album.coverHue}
                      imageUrl={album.coverImageUrl}
                      size="sm"
                      className="size-8 rounded-sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{album.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {album.artist} · {album.durationMinutes} min
                      </p>
                    </div>
                    <SearchIcon className="size-3.5 text-muted-foreground" />
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
