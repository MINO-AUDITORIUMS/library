"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon, Loader2Icon, SearchIcon, SparklesIcon } from "lucide-react"
import { toast } from "sonner"

import { AlbumTagsField } from "@/components/catalog/album-tags-field"
import { ArtistImportPanel } from "@/app/bibliotheque/_components/artist-import-panel"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { CatalogSearchHit } from "@/lib/catalog/discogs/types"
import type { ArtistImportPreview } from "@/lib/catalog/build-artist-preview"
import { albumDetailRoute, routes } from "@/lib/routes"

function normalizeReleaseDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : ""
}

function buildImportUrl(spotifyAlbumId: string) {
  const params = new URLSearchParams()
  params.set("spotifyAlbum", spotifyAlbumId)
  return `/api/catalog/import?${params.toString()}`
}

function resultArtistLine(hit: CatalogSearchHit) {
  return [hit.artist, hit.subtitle, hit.year].filter(Boolean).join(" · ")
}

type FormState = {
  title: string
  artist: string
  releaseYear: string
  releaseDate: string
  genre: string
  subgenre: string
  label: string
  recordCompany: string
  producers: string
  country: string
  description: string
  personalNotes: string
  trackCount: string
  spotifyAlbumId: string | null
  discogsReleaseId: number | null
  musicbrainzReleaseId: string | null
  discogsArtistId: number | null
  musicbrainzArtistId: string | null
  spotifyArtistId: string | null
  coverImageUrl: string | null
  certification: string
  tags: string[]
}

const emptyForm: FormState = {
  title: "",
  artist: "",
  releaseYear: "",
  releaseDate: "",
  genre: "",
  subgenre: "",
  label: "",
  recordCompany: "",
  producers: "",
  country: "",
  description: "",
  personalNotes: "",
  trackCount: "",
  spotifyAlbumId: null,
  discogsReleaseId: null,
  musicbrainzReleaseId: null,
  discogsArtistId: null,
  musicbrainzArtistId: null,
  spotifyArtistId: null,
  coverImageUrl: null,
  certification: "",
  tags: [],
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  )
}

function Field({
  id,
  label,
  children,
}: {
  id: string
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  )
}

export function AlbumCreateForm() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<CatalogSearchHit[]>([])
  const [form, setForm] = useState<FormState>(emptyForm)
  const [artistPreview, setArtistPreview] = useState<ArtistImportPreview | null>(
    null
  )
  const [saving, setSaving] = useState(false)
  const [importingKey, setImportingKey] = useState<string | null>(null)

  function patchForm(partial: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...partial }))
  }

  async function onSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = searchQuery.trim()
    if (q.length < 2) {
      toast.error("Saisis au moins 2 caractères.")
      return
    }

    setSearching(true)
    setResults([])
    setArtistPreview(null)

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

  async function applyResult(hit: CatalogSearchHit) {
    if (!hit.spotifyAlbumId) {
      toast.error("Cette référence Spotify ne peut pas être importée.")
      return
    }

    setImportingKey(hit.key)

    try {
      const response = await fetch(buildImportUrl(hit.spotifyAlbumId))
      const data = (await response.json()) as {
        release?: {
          title: string
          artist: string
          releaseYear: string
          releaseDate: string
          genre: string
          subgenre: string
          label: string
          recordCompany: string
          producers: string
          country: string
          description: string
          trackCount: string
          spotifyAlbumId: string | null
          discogsReleaseId: number | null
          musicbrainzReleaseId: string | null
          discogsArtistId: number | null
          musicbrainzArtistId: string | null
          spotifyArtistId: string | null
          coverUrl: string | null
          certification: string
        }
        artist?: ArtistImportPreview | null
        sources?: {
          spotify: boolean
          discogs: boolean
          musicbrainz: boolean
        }
        variantCount?: number | null
        error?: string
      }

      if (!response.ok || !data.release) {
        toast.error(data.error ?? "Import impossible.")
        return
      }

      const release = data.release
      patchForm({
        title: release.title,
        artist: release.artist,
        releaseYear: release.releaseYear,
        releaseDate: normalizeReleaseDate(release.releaseDate),
        genre: release.genre,
        subgenre: release.subgenre,
        label: release.label,
        recordCompany: release.recordCompany,
        producers: release.producers,
        country: release.country,
        description: release.description,
        trackCount: release.trackCount,
        spotifyAlbumId: release.spotifyAlbumId,
        discogsReleaseId: release.discogsReleaseId,
        musicbrainzReleaseId: release.musicbrainzReleaseId,
        discogsArtistId: release.discogsArtistId,
        musicbrainzArtistId: release.musicbrainzArtistId,
        spotifyArtistId: release.spotifyArtistId,
        coverImageUrl: release.coverUrl,
        certification: release.certification,
      })
      setArtistPreview(data.artist ?? null)
      setResults([])

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
      setImportingKey(null)
    }
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
      const data = (await response.json()) as { id?: string; error?: string }

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
          <h1 className="text-2xl font-semibold tracking-tight">Nouvel album</h1>
          <p className="text-sm text-muted-foreground">
            Page dédiée — import Spotify avec complément Discogs / MusicBrainz.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={routes.bibliotheque}>
            <ArrowLeftIcon />
            Retour
          </Link>
        </Button>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <SparklesIcon className="size-4 text-primary" />
            Recherche automatique
          </CardTitle>
          <CardDescription>
            Recherche Spotify par album ou artiste. À la sélection, l&apos;album
            est enrichi automatiquement via Discogs et MusicBrainz pour les
            métadonnées manquantes.
          </CardDescription>
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
              />
            </div>
            <Button type="submit" disabled={searching}>
              {searching ? <Loader2Icon className="animate-spin" /> : null}
              Rechercher
            </Button>
          </form>

          {results.length > 0 ? (
            <ul className="space-y-2">
              {results.map((item) => (
                <li key={item.key}>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-auto w-full justify-start gap-3 px-3 py-3 text-left"
                    disabled={importingKey !== null}
                    onClick={() => applyResult(item)}
                  >
                    {item.thumbUrl ? (
                      <img
                        src={item.thumbUrl}
                        alt=""
                        className="size-12 shrink-0 rounded object-cover"
                      />
                    ) : null}
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {resultArtistLine(item)}
                      </p>
                    </div>
                    {importingKey === item.key ? (
                      <Loader2Icon className="size-4 shrink-0 animate-spin" />
                    ) : null}
                  </Button>
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>

      {artistPreview ? <ArtistImportPanel preview={artistPreview} /> : null}

      <form onSubmit={onSubmit} className="space-y-6">
        <FormSection title="Identification">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="title" label="Titre">
              <Input
                id="title"
                value={form.title}
                onChange={(e) => patchForm({ title: e.target.value })}
                required
              />
            </Field>
            <Field id="artist" label="Artiste / groupe">
              <Input
                id="artist"
                value={form.artist}
                onChange={(e) => patchForm({ artist: e.target.value })}
                required
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Sortie">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="releaseYear" label="Année">
              <Input
                id="releaseYear"
                type="number"
                value={form.releaseYear}
                onChange={(e) => patchForm({ releaseYear: e.target.value })}
              />
            </Field>
            <Field id="releaseDate" label="Date exacte">
              <Input
                id="releaseDate"
                type="date"
                value={form.releaseDate}
                onChange={(e) => patchForm({ releaseDate: e.target.value })}
              />
            </Field>
            <Field id="trackCount" label="Nombre de titres">
              <Input
                id="trackCount"
                type="number"
                value={form.trackCount}
                onChange={(e) => patchForm({ trackCount: e.target.value })}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection
          title="Tags"
          description="Libellés transverses pour classer et filtrer la bibliothèque."
        >
          <AlbumTagsField
            value={form.tags}
            onChange={(tags) => patchForm({ tags })}
          />
        </FormSection>

        <FormSection title="Caractéristiques musicales">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="genre" label="Genre">
              <Input
                id="genre"
                value={form.genre}
                onChange={(e) => patchForm({ genre: e.target.value })}
              />
            </Field>
            <Field id="subgenre" label="Sous-genre">
              <Input
                id="subgenre"
                value={form.subgenre}
                onChange={(e) => patchForm({ subgenre: e.target.value })}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Production">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="label" label="Label">
              <Input
                id="label"
                value={form.label}
                onChange={(e) => patchForm({ label: e.target.value })}
              />
            </Field>
            <Field id="recordCompany" label="Maison de disques">
              <Input
                id="recordCompany"
                value={form.recordCompany}
                onChange={(e) => patchForm({ recordCompany: e.target.value })}
              />
            </Field>
            <Field id="producers" label="Producteur(s)">
              <Input
                id="producers"
                value={form.producers}
                onChange={(e) => patchForm({ producers: e.target.value })}
                placeholder="Séparés par des virgules"
              />
            </Field>
            <Field id="country" label="Pays / origine">
              <Input
                id="country"
                value={form.country}
                onChange={(e) => patchForm({ country: e.target.value })}
              />
            </Field>
            <Field id="certification" label="Certification">
              <Input
                id="certification"
                value={form.certification}
                onChange={(e) => patchForm({ certification: e.target.value })}
                placeholder="Or, Platine…"
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Contenu">
          <Field id="description" label="Description">
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => patchForm({ description: e.target.value })}
              rows={4}
            />
          </Field>
        </FormSection>

        <FormSection title="Remarques">
          <Field id="personalNotes" label="Notes internes">
            <Textarea
              id="personalNotes"
              value={form.personalNotes}
              onChange={(e) => patchForm({ personalNotes: e.target.value })}
              rows={3}
            />
          </Field>
        </FormSection>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" asChild>
            <Link href={routes.bibliotheque}>Annuler</Link>
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2Icon className="animate-spin" /> : null}
            Enregistrer l&apos;album
          </Button>
        </div>
      </form>

    </div>
  )
}
