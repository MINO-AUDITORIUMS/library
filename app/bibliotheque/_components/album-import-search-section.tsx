"use client"

import {
  Loader2Icon,
  PenLineIcon,
  SearchIcon,
  SparklesIcon,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { AlbumImportQueuePanel } from "@/app/bibliotheque/_components/album-import-queue-panel"
import { AlbumSearchResultRow } from "@/app/bibliotheque/_components/album-search-result-row"
import type { useAlbumImportQueue } from "@/app/bibliotheque/_components/use-album-import-queue"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { releaseToFormState } from "@/lib/catalog/album-create-form-state"
import type { ArtistImportPreview } from "@/lib/catalog/build-artist-preview"
import type { CatalogSearchHit } from "@/lib/catalog/discogs/types"
import { fetchCatalogImport } from "@/lib/catalog/fetch-catalog-import"

type ImportQueue = ReturnType<typeof useAlbumImportQueue>

export type AlbumImportSearchSectionProps = {
  importQueue: ImportQueue
  manualFormHidden: boolean
  onShowManualForm: () => void
  onApplyToForm: (
    form: ReturnType<typeof releaseToFormState>,
    artist: ArtistImportPreview | null
  ) => void
}

export function AlbumImportSearchSection({
  importQueue,
  manualFormHidden,
  onShowManualForm,
  onApplyToForm,
}: AlbumImportSearchSectionProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<CatalogSearchHit[]>([])
  const [editingKey, setEditingKey] = useState<string | null>(null)

  const {
    queue,
    importing,
    isQueued,
    toggle,
    remove,
    clear,
    clearFinished,
    importAll,
    openAlbum,
  } = importQueue

  async function onSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = searchQuery.trim()
    if (q.length < 2) {
      toast.error("Saisis au moins 2 caractères.")
      return
    }

    setSearching(true)

    try {
      const response = await fetch(
        `/api/catalog/search?q=${encodeURIComponent(q)}`
      )
      const data = (await response.json()) as {
        results?: CatalogSearchHit[]
        error?: string
      }

      if (!response.ok) {
        toast.error(data.error ?? "Recherche catalogue impossible.")
        return
      }

      setResults(data.results ?? [])
      if ((data.results ?? []).length === 0) {
        toast.message("Aucun album trouvé.")
      }
    } catch {
      toast.error("Erreur réseau lors de la recherche.")
    } finally {
      setSearching(false)
    }
  }

  async function applyToForm(hit: CatalogSearchHit) {
    if (!hit.spotifyAlbumId) {
      toast.error("Cette référence Spotify ne peut pas être importée.")
      return
    }

    setEditingKey(hit.key)

    try {
      const { ok, data } = await fetchCatalogImport(hit.spotifyAlbumId)

      if (!ok || !data.release) {
        toast.error(data.error ?? "Import impossible.")
        return
      }

      if (data.existingAlbumId) {
        toast.warning("Cet album est déjà en bibliothèque.", {
          action: {
            label: "Voir la fiche",
            onClick: () => openAlbum(data.existingAlbumId!),
          },
        })
        return
      }

      onApplyToForm(releaseToFormState(data.release), data.artist ?? null)

      const sources = data.sources
      const variantSuffix =
        data.variantCount && data.variantCount > 1
          ? ` (${data.variantCount} éditions analysées)`
          : ""

      const sourceParts = [
        sources?.spotify ? "Spotify" : null,
        sources?.discogs ? "Discogs" : null,
        sources?.musicbrainz ? "MusicBrainz" : null,
      ].filter(Boolean)

      toast.success(
        `Référence importée${variantSuffix} · ${sourceParts.join(" + ") || "catalogue"}`
      )
    } catch {
      toast.error("Erreur réseau lors de l'import.")
    } finally {
      setEditingKey(null)
    }
  }

  function onToggleQueue(hit: CatalogSearchHit) {
    if (!hit.spotifyAlbumId) {
      toast.error("Cette référence Spotify ne peut pas être importée.")
      return
    }
    const wasQueued = isQueued(hit.key)
    toggle(hit)
    if (!wasQueued) {
      toast.message(`« ${hit.title} » ajouté à la file.`)
    }
  }

  async function onImportAll() {
    const summary = await importAll()
    const parts: string[] = []
    if (summary.success > 0) {
      parts.push(
        `${summary.success} album${summary.success > 1 ? "s" : ""} importé${summary.success > 1 ? "s" : ""}`
      )
    }
    if (summary.duplicate > 0) {
      parts.push(
        `${summary.duplicate} doublon${summary.duplicate > 1 ? "s" : ""} ignoré${summary.duplicate > 1 ? "s" : ""}`
      )
    }
    if (summary.error > 0) {
      parts.push(`${summary.error} erreur${summary.error > 1 ? "s" : ""}`)
    }

    if (parts.length === 0) return

    if (summary.error > 0) {
      toast.warning(parts.join(" · "))
    } else {
      toast.success(parts.join(" · "))
    }
  }

  const busy = searching || importing || editingKey !== null

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <SparklesIcon className="size-4 text-primary" />
          Recherche automatique
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={onSearch} className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nom de l'album, artiste…"
              className="pl-8"
              disabled={importing}
            />
          </div>
          <Button type="submit" disabled={busy}>
            {searching ? <Loader2Icon className="animate-spin" /> : null}
            Rechercher
          </Button>
        </form>

        {results.length > 0 ? (
          <ul className="space-y-2">
            {results.map((item) => (
              <li key={item.key}>
                <AlbumSearchResultRow
                  hit={item}
                  queued={isQueued(item.key)}
                  loading={editingKey === item.key}
                  disabled={busy}
                  onToggleQueue={() => onToggleQueue(item)}
                  onEdit={() => applyToForm(item)}
                />
              </li>
            ))}
          </ul>
        ) : null}

        <AlbumImportQueuePanel
          queue={queue}
          importing={importing}
          onRemove={remove}
          onClear={clear}
          onClearFinished={clearFinished}
          onImportAll={onImportAll}
          onOpenAlbum={openAlbum}
        />

        {manualFormHidden ? (
          <div className="flex justify-center border-t pt-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onShowManualForm}
            >
              <PenLineIcon />
              Saisie manuelle
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
