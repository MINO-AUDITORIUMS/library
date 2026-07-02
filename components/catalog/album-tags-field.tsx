"use client"

import { Loader2Icon, PlusIcon, Trash2Icon, XIcon } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { CatalogTag } from "@/lib/catalog/types"
import { cn } from "@/lib/utils"

export type AlbumTagsFieldProps = {
  value: string[]
  onChange: (tags: string[]) => void
  disabled?: boolean
}

function tagKey(name: string) {
  return name.trim().toLowerCase()
}

function hasTag(tags: string[], name: string) {
  const key = tagKey(name)
  return tags.some((tag) => tagKey(tag) === key)
}

function addTag(tags: string[], name: string) {
  const trimmed = name.trim()
  if (!trimmed || hasTag(tags, trimmed)) return tags
  return [...tags, trimmed]
}

function removeTag(tags: string[], name: string) {
  const key = tagKey(name)
  return tags.filter((tag) => tagKey(tag) !== key)
}

export function AlbumTagsField({
  value,
  onChange,
  disabled = false,
}: AlbumTagsFieldProps) {
  const [catalog, setCatalog] = useState<CatalogTag[]>([])
  const [loadingCatalog, setLoadingCatalog] = useState(true)
  const [query, setQuery] = useState("")
  const [creating, setCreating] = useState(false)
  const [tagToDelete, setTagToDelete] = useState<CatalogTag | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadCatalog = useCallback(async () => {
    setLoadingCatalog(true)
    try {
      const response = await fetch("/api/catalog/tags")
      const data = (await response.json()) as {
        tags?: CatalogTag[]
        error?: string
      }
      if (!response.ok) {
        toast.error(data.error ?? "Impossible de charger les tags.")
        return
      }
      setCatalog(data.tags ?? [])
    } catch {
      toast.error("Erreur réseau lors du chargement des tags.")
    } finally {
      setLoadingCatalog(false)
    }
  }, [])

  useEffect(() => {
    loadCatalog()
  }, [loadCatalog])

  const trimmedQuery = query.trim()

  const listedTags = useMemo(() => {
    if (!trimmedQuery) return catalog
    const q = trimmedQuery.toLowerCase()
    return catalog.filter((tag) => tag.name.toLowerCase().includes(q))
  }, [catalog, trimmedQuery])

  const exactCatalogMatch = useMemo(() => {
    if (!trimmedQuery) return false
    const key = tagKey(trimmedQuery)
    return catalog.some((tag) => tagKey(tag.name) === key)
  }, [catalog, trimmedQuery])

  const showCreate =
    trimmedQuery.length > 0 &&
    !hasTag(value, trimmedQuery) &&
    !exactCatalogMatch

  function selectTag(name: string) {
    if (hasTag(value, name)) return
    onChange(addTag(value, name))
    setQuery("")
  }

  async function createTag() {
    if (!trimmedQuery || disabled) return

    setCreating(true)
    try {
      const response = await fetch("/api/catalog/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedQuery }),
      })
      const data = (await response.json()) as {
        tag?: CatalogTag
        error?: string
      }

      if (!response.ok || !data.tag) {
        toast.error(data.error ?? "Impossible de créer le tag.")
        return
      }

      setCatalog((prev) => {
        if (prev.some((tag) => tag.id === data.tag!.id)) return prev
        return [...prev, data.tag!].sort((a, b) =>
          a.name.localeCompare(b.name, "fr")
        )
      })
      onChange(addTag(value, data.tag.name))
      setQuery("")
    } catch {
      toast.error("Erreur réseau lors de la création du tag.")
    } finally {
      setCreating(false)
    }
  }

  async function confirmDeleteTag() {
    if (!tagToDelete || disabled) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/catalog/tags/${tagToDelete.id}`, {
        method: "DELETE",
      })
      const data = (await response.json()) as { error?: string }

      if (!response.ok) {
        toast.error(data.error ?? "Impossible de supprimer le tag.")
        return
      }

      setCatalog((prev) => prev.filter((tag) => tag.id !== tagToDelete.id))
      onChange(removeTag(value, tagToDelete.name))
      setTagToDelete(null)
      toast.success("Tag supprimé.")
    } catch {
      toast.error("Erreur réseau lors de la suppression.")
    } finally {
      setDeleting(false)
    }
  }

  function onQueryKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter" || disabled) return
    e.preventDefault()

    const firstAvailable = listedTags.find((tag) => !hasTag(value, tag.name))
    if (firstAvailable) {
      selectTag(firstAvailable.name)
      return
    }

    if (showCreate) {
      void createTag()
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="mt-1 text-sm text-muted-foreground">
          Choisis dans la liste, crée un tag ou supprime un tag du catalogue.
        </p>
      </div>

      {value.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <Badge key={tagKey(tag)} variant="secondary" className="gap-1 pr-1">
              {tag}
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="size-5"
                disabled={disabled}
                aria-label={`Retirer le tag ${tag}`}
                onClick={() => onChange(removeTag(value, tag))}
              >
                <XIcon className="size-3" />
              </Button>
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Aucun tag pour l&apos;instant.
        </p>
      )}

      <div className="space-y-2">
        <Input
          id="album-tags-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onQueryKeyDown}
          placeholder="Rechercher ou créer un tag…"
          disabled={disabled}
          autoComplete="off"
        />

        {loadingCatalog ? (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2Icon className="size-3 animate-spin" />
            Chargement des tags…
          </p>
        ) : null}

        {!loadingCatalog && catalog.length > 0 ? (
          <div
            className={cn(
              "rounded-lg border border-border bg-popover p-1 shadow-sm",
              "max-h-56 overflow-y-auto"
            )}
          >
            <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              Tags existants
            </p>

            {listedTags.length === 0 ? (
              <p className="px-2 pb-2 text-sm text-muted-foreground">
                Aucun tag ne correspond à ta recherche.
              </p>
            ) : (
              listedTags.map((tag) => {
                const onAlbum = hasTag(value, tag.name)
                return (
                  <div
                    key={tag.id}
                    className="flex items-center gap-0.5 border-t border-border/60 first:border-t-0"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-auto min-h-9 flex-1 justify-start px-2 py-2 text-left text-sm font-normal"
                      disabled={disabled || onAlbum}
                      onClick={() => selectTag(tag.name)}
                    >
                      <span className="truncate">{tag.name}</span>
                      {onAlbum ? (
                        <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                          Ajouté
                        </span>
                      ) : null}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      disabled={disabled}
                      aria-label={`Supprimer le tag ${tag.name}`}
                      onClick={() => setTagToDelete(tag)}
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  </div>
                )
              })
            )}

            {showCreate ? (
              <Button
                type="button"
                variant="ghost"
                className="h-auto w-full justify-start gap-2 border-t border-border/60 px-2 py-2 text-sm font-normal"
                disabled={disabled || creating}
                onClick={() => void createTag()}
              >
                {creating ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <PlusIcon className="size-4" />
                )}
                Créer « {trimmedQuery} »
              </Button>
            ) : null}
          </div>
        ) : null}

        {!loadingCatalog && catalog.length === 0 && showCreate ? (
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start gap-2"
            disabled={disabled || creating}
            onClick={() => void createTag()}
          >
            {creating ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <PlusIcon className="size-4" />
            )}
            Créer « {trimmedQuery} »
          </Button>
        ) : null}
      </div>

      <AlertDialog
        open={tagToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setTagToDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Supprimer le tag « {tagToDelete?.name} » ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Ce tag sera retiré de tous les albums de la bibliothèque. Cette
              action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault()
                void confirmDeleteTag()
              }}
            >
              {deleting ? <Loader2Icon className="animate-spin" /> : null}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
