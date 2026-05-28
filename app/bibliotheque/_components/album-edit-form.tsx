"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"

import {
  AlbumCatalogFormFields,
  type AlbumCatalogFormState,
} from "@/app/bibliotheque/_components/album-catalog-form-fields"
import { Button } from "@/components/ui/button"
import type { AlbumDetail } from "@/lib/catalog/types"
import { albumDetailRoute } from "@/lib/routes"

function displayToInput(value: string) {
  return value === "—" ? "" : value
}

function albumToFormState(album: AlbumDetail): AlbumCatalogFormState {
  const producers =
    album.producers.length === 1 && album.producers[0] === "—"
      ? ""
      : album.producers.join(", ")

  return {
    title: album.title,
    artist: album.artist,
    releaseYear: album.releaseYear > 0 ? String(album.releaseYear) : "",
    releaseDate: album.releaseDate ?? "",
    genre: album.genreName,
    subgenre: album.subgenreName,
    label: displayToInput(album.label),
    recordCompany: displayToInput(album.recordCompany),
    producers,
    country: displayToInput(album.country),
    format: album.format,
    description: displayToInput(album.description),
    personalNotes: album.personalNotes,
    rating: album.rating,
    trackCount: album.trackCount > 0 ? String(album.trackCount) : "",
    tags: [...album.tags],
  }
}

export type AlbumEditFormProps = {
  album: AlbumDetail
}

export function AlbumEditForm({ album }: AlbumEditFormProps) {
  const router = useRouter()
  const [form, setForm] = useState(() => albumToFormState(album))
  const [saving, setSaving] = useState(false)

  function patchForm(partial: Partial<AlbumCatalogFormState>) {
    setForm((prev) => ({ ...prev, ...partial }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.artist.trim()) {
      toast.error("Titre et artiste sont obligatoires.")
      return
    }

    setSaving(true)

    try {
      const response = await fetch(`/api/albums/${album.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = (await response.json()) as { id?: string; error?: string }

      if (!response.ok || !data.id) {
        toast.error(data.error ?? "Impossible de mettre à jour l'album.")
        return
      }

      toast.success("Album mis à jour.")
      router.push(albumDetailRoute(album.id))
      router.refresh()
    } catch {
      toast.error("Erreur réseau lors de la mise à jour.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Modifier l&apos;album
          </h1>
          <p className="text-sm text-muted-foreground">{album.title}</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={albumDetailRoute(album.id)}>
            <ArrowLeftIcon />
            Retour
          </Link>
        </Button>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <AlbumCatalogFormFields form={form} onPatch={patchForm} />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" asChild>
            <Link href={albumDetailRoute(album.id)}>Annuler</Link>
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2Icon className="animate-spin" /> : null}
            Enregistrer les modifications
          </Button>
        </div>
      </form>
    </div>
  )
}
