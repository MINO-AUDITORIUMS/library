"use client"

import type { EditorCreditField } from "@/app/bibliotheque/_components/use-tracklist-editor"
import { CreditNamesField } from "@/components/catalog/credit-names-field"
import { FeaturingArtistField } from "@/components/catalog/featuring-artist-field"

export type AlbumTracklistEditCreditsProps = {
  featuring: string[]
  writers: string[]
  producers: string[]
  disabled: boolean
  onCreditsChange: (field: EditorCreditField, value: string[]) => void
}

export function AlbumTracklistEditCredits({
  featuring,
  writers,
  producers,
  disabled,
  onCreditsChange,
}: AlbumTracklistEditCreditsProps) {
  return (
    <div className="mt-3 min-w-0 space-y-3 border-t border-border/60 pt-3 pl-11">
      <FeaturingArtistField
        value={featuring}
        onChange={(value) => onCreditsChange("featuring", value)}
        disabled={disabled}
      />

      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        <div className="min-w-0">
          <CreditNamesField
            label="Écriture"
            value={writers}
            onChange={(value) => onCreditsChange("writers", value)}
            placeholder="Ajouter un auteur puis Entrée"
            disabled={disabled}
          />
        </div>
        <div className="min-w-0">
          <CreditNamesField
            label="Production"
            value={producers}
            onChange={(value) => onCreditsChange("producers", value)}
            placeholder="Ajouter un producteur puis Entrée"
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  )
}
