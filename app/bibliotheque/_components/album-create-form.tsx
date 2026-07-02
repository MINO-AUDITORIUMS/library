"use client"

import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { AlbumCreateManualForm } from "@/app/bibliotheque/_components/album-create-manual-form"
import { AlbumImportSearchSection } from "@/app/bibliotheque/_components/album-import-search-section"
import { ArtistImportPanel } from "@/app/bibliotheque/_components/artist-import-panel"
import { useAlbumImportQueue } from "@/app/bibliotheque/_components/use-album-import-queue"
import { Button } from "@/components/ui/button"
import {
  emptyAlbumCreateForm,
  type AlbumCreateFormState,
} from "@/lib/catalog/album-create-form-state"
import type { ArtistImportPreview } from "@/lib/catalog/build-artist-preview"
import { albumDetailRoute, routes } from "@/lib/routes"

function hasPendingQueue(
  queue: ReturnType<typeof useAlbumImportQueue>["queue"]
) {
  return queue.some((item) => item.status === "pending")
}

export function AlbumCreateForm() {
  const router = useRouter()
  const importQueue = useAlbumImportQueue()
  const [form, setForm] = useState<AlbumCreateFormState>(emptyAlbumCreateForm)
  const [artistPreview, setArtistPreview] =
    useState<ArtistImportPreview | null>(null)
  const [saving, setSaving] = useState(false)
  const [manualFormOpen, setManualFormOpen] = useState(false)

  const multiImportActive =
    importQueue.importing || hasPendingQueue(importQueue.queue)
  const showManualForm = !multiImportActive || manualFormOpen

  function patchForm(partial: Partial<AlbumCreateFormState>) {
    setForm((prev) => ({ ...prev, ...partial }))
  }

  function applyImportToForm(
    nextForm: AlbumCreateFormState,
    artist: ArtistImportPreview | null
  ) {
    setForm(nextForm)
    setArtistPreview(artist)
    setManualFormOpen(true)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.artist.trim()) {
      toast.error("Titre et artiste sont obligatoires.")
      return
    }
    setSaving(true)

    try {
      const response = await fetch("/api/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = (await response.json()) as {
        id?: string
        existingId?: string
        error?: string
      }

      if (response.status === 409 && data.existingId) {
        toast.error(data.error ?? "Cet album est déjà en bibliothèque.", {
          action: {
            label: "Voir la fiche",
            onClick: () => router.push(albumDetailRoute(data.existingId!)),
          },
        })
        return
      }

      if (!response.ok || !data.id) {
        toast.error(data.error ?? "Impossible d'enregistrer l'album.")
        return
      }

      toast.success("Album enregistré.")
      router.push(albumDetailRoute(data.id))
      router.refresh()
    } catch {
      toast.error("Erreur réseau lors de l'enregistrement.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Nouvel album
          </h1>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={routes.bibliotheque}>
            <ArrowLeftIcon />
            Retour
          </Link>
        </Button>
      </div>

      <AlbumImportSearchSection
        importQueue={importQueue}
        manualFormHidden={!showManualForm}
        onShowManualForm={() => setManualFormOpen(true)}
        onApplyToForm={applyImportToForm}
      />

      {showManualForm ? (
        <>
          {artistPreview ? <ArtistImportPanel preview={artistPreview} /> : null}

          <AlbumCreateManualForm
            form={form}
            saving={saving}
            onPatch={patchForm}
            onSubmit={onSubmit}
          />
        </>
      ) : null}
    </div>
  )
}
