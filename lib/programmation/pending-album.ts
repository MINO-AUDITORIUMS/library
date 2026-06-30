import { PENDING_ALBUM_KEY } from "@/lib/programmation/constants"
import type { ProgrammationAlbumRef } from "@/lib/programmation/types"

export function stashPendingAlbum(album: ProgrammationAlbumRef) {
  if (typeof window === "undefined") return
  window.sessionStorage.setItem(PENDING_ALBUM_KEY, JSON.stringify(album))
}

export function consumePendingAlbum(): ProgrammationAlbumRef | null {
  if (typeof window === "undefined") return null

  const raw = window.sessionStorage.getItem(PENDING_ALBUM_KEY)
  if (!raw) return null

  window.sessionStorage.removeItem(PENDING_ALBUM_KEY)

  try {
    return JSON.parse(raw) as ProgrammationAlbumRef
  } catch {
    return null
  }
}
