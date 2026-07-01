"use client"

import { useState } from "react"
import { Loader2Icon, PencilIcon, PlusIcon } from "lucide-react"

import { AlbumTracklistEditRow } from "@/app/bibliotheque/_components/album-tracklist-edit-row"
import { useTracklistEditor } from "@/app/bibliotheque/_components/use-tracklist-editor"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export type AlbumTracklistEditButtonProps = {
  albumId: string
  albumTitle: string
}

export function AlbumTracklistEditButton({
  albumId,
  albumTitle,
}: AlbumTracklistEditButtonProps) {
  const [open, setOpen] = useState(false)
  const {
    tracks,
    loading,
    saving,
    load,
    patchTrack,
    patchCredits,
    removeTrack,
    moveTrack,
    addTrack,
    save,
  } = useTracklistEditor(albumId)

  function onOpenChange(next: boolean) {
    setOpen(next)
    if (next) void load()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <PencilIcon />
          Modifier
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex min-w-0 flex-col gap-0 p-0 data-[side=right]:sm:w-[min(50vw,56rem)] data-[side=right]:sm:max-w-[min(50vw,56rem)]"
      >
        <SheetHeader className="border-b">
          <SheetTitle>Modifier la tracklist</SheetTitle>
          <SheetDescription>{albumTitle}</SheetDescription>
        </SheetHeader>

        <div className="min-w-0 flex-1 space-y-2 overflow-x-hidden overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2Icon className="size-5 animate-spin" />
            </div>
          ) : tracks.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              Aucune piste. Ajoute la première ci-dessous.
            </p>
          ) : (
            tracks.map((track, index) => (
              <AlbumTracklistEditRow
                key={track.key}
                track={track}
                position={index + 1}
                isFirst={index === 0}
                isLast={index === tracks.length - 1}
                disabled={saving}
                onPatch={patchTrack}
                onPatchCredits={patchCredits}
                onMove={moveTrack}
                onRemove={removeTrack}
              />
            ))
          )}

          {!loading ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              disabled={saving}
              onClick={addTrack}
            >
              <PlusIcon />
              Ajouter une piste
            </Button>
          ) : null}
        </div>

        <SheetFooter className="border-t sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => setOpen(false)}
          >
            Annuler
          </Button>
          <Button
            type="button"
            disabled={saving || loading}
            onClick={() => save(() => setOpen(false))}
          >
            {saving ? <Loader2Icon className="animate-spin" /> : null}
            Enregistrer
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
