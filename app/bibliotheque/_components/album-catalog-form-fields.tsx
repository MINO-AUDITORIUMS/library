import { AlbumTagsField } from "@/components/catalog/album-tags-field"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export type AlbumCatalogFormState = {
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
  format: string
  description: string
  personalNotes: string
  trackCount: string
  tags: string[]
}

export function FormSection({
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

export type AlbumCatalogFormFieldsProps = {
  form: AlbumCatalogFormState
  onPatch: (partial: Partial<AlbumCatalogFormState>) => void
}

export function AlbumCatalogFormFields({
  form,
  onPatch,
}: AlbumCatalogFormFieldsProps) {
  return (
    <>
      <FormSection title="Identification">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="title" label="Titre">
            <Input
              id="title"
              value={form.title}
              onChange={(e) => onPatch({ title: e.target.value })}
              required
            />
          </Field>
          <Field id="artist" label="Artiste / groupe">
            <Input
              id="artist"
              value={form.artist}
              onChange={(e) => onPatch({ artist: e.target.value })}
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
              onChange={(e) => onPatch({ releaseYear: e.target.value })}
            />
          </Field>
          <Field id="releaseDate" label="Date exacte">
            <Input
              id="releaseDate"
              type="date"
              value={form.releaseDate}
              onChange={(e) => onPatch({ releaseDate: e.target.value })}
            />
          </Field>
          <Field id="trackCount" label="Nombre de titres">
            <Input
              id="trackCount"
              type="number"
              value={form.trackCount}
              onChange={(e) => onPatch({ trackCount: e.target.value })}
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
          onChange={(tags) => onPatch({ tags })}
        />
      </FormSection>

      <FormSection title="Caractéristiques musicales">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="genre" label="Genre">
            <Input
              id="genre"
              value={form.genre}
              onChange={(e) => onPatch({ genre: e.target.value })}
            />
          </Field>
          <Field id="subgenre" label="Sous-genre">
            <Input
              id="subgenre"
              value={form.subgenre}
              onChange={(e) => onPatch({ subgenre: e.target.value })}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Production & format">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="label" label="Label">
            <Input
              id="label"
              value={form.label}
              onChange={(e) => onPatch({ label: e.target.value })}
            />
          </Field>
          <Field id="recordCompany" label="Maison de disques">
            <Input
              id="recordCompany"
              value={form.recordCompany}
              onChange={(e) => onPatch({ recordCompany: e.target.value })}
            />
          </Field>
          <Field id="producers" label="Producteur(s)">
            <Input
              id="producers"
              value={form.producers}
              onChange={(e) => onPatch({ producers: e.target.value })}
              placeholder="Séparés par des virgules"
            />
          </Field>
          <Field id="format" label="Format">
            <Input
              id="format"
              value={form.format}
              onChange={(e) => onPatch({ format: e.target.value })}
            />
          </Field>
          <Field id="country" label="Pays / origine">
            <Input
              id="country"
              value={form.country}
              onChange={(e) => onPatch({ country: e.target.value })}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Contenu">
        <Field id="description" label="Description">
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => onPatch({ description: e.target.value })}
            rows={4}
          />
        </Field>
      </FormSection>

      <FormSection title="Remarques">
        <Field id="personalNotes" label="Notes internes">
          <Textarea
            id="personalNotes"
            value={form.personalNotes}
            onChange={(e) => onPatch({ personalNotes: e.target.value })}
            rows={3}
          />
        </Field>
      </FormSection>
    </>
  )
}
