"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon, Loader2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { ArtistDetail } from "@/lib/catalog/types"
import { artistDetailRoute } from "@/lib/routes"

export type ArtistEditFormState = {
  name: string
  country: string
  bio: string
}

function artistToFormState(artist: ArtistDetail): ArtistEditFormState {
  return {
    name: artist.name,
    country: artist.country,
    bio: artist.bio,
  }
}

export type ArtistEditFormProps = {
  artist: ArtistDetail
}

export function ArtistEditForm({ artist }: ArtistEditFormProps) {
  const router = useRouter()
  const [form, setForm] = useState(() => artistToFormState(artist))
  const [saving, setSaving] = useState(false)

  function patchForm(partial: Partial<ArtistEditFormState>) {
    setForm((prev) => ({ ...prev, ...partial }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error("Le nom est obligatoire.")
      return
    }

    setSaving(true)

    try {
      const response = await fetch(`/api/artists/${artist.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = (await response.json()) as { id?: string; error?: string }

      if (!response.ok || !data.id) {
        toast.error(data.error ?? "Impossible de mettre à jour l'artiste.")
        return
      }

      toast.success("Artiste mis à jour.")
      router.push(artistDetailRoute(artist.id))
      router.refresh()
    } catch {
      toast.error("Erreur réseau lors de la mise à jour.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Modifier l&apos;artiste
          </h1>
          <p className="text-sm text-muted-foreground">{artist.name}</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={artistDetailRoute(artist.id)}>
            <ArrowLeftIcon />
            Retour
          </Link>
        </Button>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => patchForm({ name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Pays / origine</Label>
              <Input
                id="country"
                value={form.country}
                onChange={(e) => patchForm({ country: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Biographie</Label>
              <Textarea
                id="bio"
                value={form.bio}
                onChange={(e) => patchForm({ bio: e.target.value })}
                rows={8}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" asChild>
            <Link href={artistDetailRoute(artist.id)}>Annuler</Link>
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
