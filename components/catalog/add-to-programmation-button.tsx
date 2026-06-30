"use client"

import { useRouter } from "next/navigation"
import { CalendarPlusIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { albumDetailToRef } from "@/lib/programmation/album-ref"
import { stashPendingAlbum } from "@/lib/programmation/pending-album"
import type { AlbumDetail } from "@/lib/catalog/types"
import { routes } from "@/lib/routes"

export type AddToProgrammationButtonProps = {
  album: AlbumDetail
}

export function AddToProgrammationButton({ album }: AddToProgrammationButtonProps) {
  const router = useRouter()

  function onSchedule() {
    stashPendingAlbum(albumDetailToRef(album))
    toast.message("Choisis la date et l'heure de la séance.")
    router.push(routes.programmation)
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={onSchedule}>
      <CalendarPlusIcon />
      Programmer
    </Button>
  )
}
