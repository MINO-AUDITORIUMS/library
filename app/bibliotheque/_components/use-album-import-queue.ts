"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"

import type { CatalogSearchHit } from "@/lib/catalog/discogs/types"
import { fetchCatalogImport } from "@/lib/catalog/fetch-catalog-import"
import { releaseToFormState } from "@/lib/catalog/album-create-form-state"
import { albumDetailRoute } from "@/lib/routes"

export type AlbumQueueItemStatus =
  | "pending"
  | "importing"
  | "success"
  | "duplicate"
  | "error"

export type AlbumQueueItem = {
  hit: CatalogSearchHit
  status: AlbumQueueItemStatus
  albumId?: string
  message?: string
}

export type AlbumImportSummary = {
  success: number
  duplicate: number
  error: number
}

export function useAlbumImportQueue() {
  const router = useRouter()
  const [queue, setQueue] = useState<AlbumQueueItem[]>([])
  const [importing, setImporting] = useState(false)

  const isQueued = useCallback(
    (key: string) => queue.some((item) => item.hit.key === key),
    [queue]
  )

  function toggle(hit: CatalogSearchHit) {
    if (!hit.spotifyAlbumId) return

    setQueue((prev) => {
      const exists = prev.some((item) => item.hit.key === hit.key)
      if (exists) {
        return prev.filter((item) => item.hit.key !== hit.key)
      }
      return [...prev, { hit, status: "pending" }]
    })
  }

  function remove(key: string) {
    setQueue((prev) => prev.filter((item) => item.hit.key !== key))
  }

  function clear() {
    setQueue([])
  }

  function clearFinished() {
    setQueue((prev) =>
      prev.filter((item) => item.status === "pending" || item.status === "importing")
    )
  }

  async function importAll(): Promise<AlbumImportSummary> {
    const summary: AlbumImportSummary = { success: 0, duplicate: 0, error: 0 }
    const pending = queue.filter((item) => item.status === "pending")
    if (pending.length === 0) return summary

    setImporting(true)

    for (const item of pending) {
      setQueue((prev) =>
        prev.map((entry) =>
          entry.hit.key === item.hit.key
            ? { ...entry, status: "importing", message: undefined }
            : entry
        )
      )

      const spotifyAlbumId = item.hit.spotifyAlbumId
      if (!spotifyAlbumId) {
        summary.error += 1
        setQueue((prev) =>
          prev.map((entry) =>
            entry.hit.key === item.hit.key
              ? {
                  ...entry,
                  status: "error",
                  message: "Référence Spotify manquante.",
                }
              : entry
          )
        )
        continue
      }

      try {
        const { ok, data } = await fetchCatalogImport(spotifyAlbumId)

        if (!ok || !data.release) {
          summary.error += 1
          setQueue((prev) =>
            prev.map((entry) =>
              entry.hit.key === item.hit.key
                ? {
                    ...entry,
                    status: "error",
                    message: data.error ?? "Import impossible.",
                  }
                : entry
            )
          )
          continue
        }

        if (data.existingAlbumId) {
          summary.duplicate += 1
          setQueue((prev) =>
            prev.map((entry) =>
              entry.hit.key === item.hit.key
                ? {
                    ...entry,
                    status: "duplicate",
                    albumId: data.existingAlbumId ?? undefined,
                    message: "Déjà en bibliothèque.",
                  }
                : entry
            )
          )
          continue
        }

        const form = releaseToFormState(data.release)
        const response = await fetch("/api/albums", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
        const created = (await response.json()) as {
          id?: string
          existingId?: string
          error?: string
        }

        if (response.status === 409 && created.existingId) {
          summary.duplicate += 1
          setQueue((prev) =>
            prev.map((entry) =>
              entry.hit.key === item.hit.key
                ? {
                    ...entry,
                    status: "duplicate",
                    albumId: created.existingId,
                    message: "Déjà en bibliothèque.",
                  }
                : entry
            )
          )
          continue
        }

        if (!response.ok || !created.id) {
          summary.error += 1
          setQueue((prev) =>
            prev.map((entry) =>
              entry.hit.key === item.hit.key
                ? {
                    ...entry,
                    status: "error",
                    message: created.error ?? "Enregistrement impossible.",
                  }
                : entry
            )
          )
          continue
        }

        summary.success += 1
        setQueue((prev) =>
          prev.map((entry) =>
            entry.hit.key === item.hit.key
              ? { ...entry, status: "success", albumId: created.id }
              : entry
          )
        )
      } catch {
        summary.error += 1
        setQueue((prev) =>
          prev.map((entry) =>
            entry.hit.key === item.hit.key
              ? {
                  ...entry,
                  status: "error",
                  message: "Erreur réseau.",
                }
              : entry
          )
        )
      }
    }

    setImporting(false)
    router.refresh()
    return summary
  }

  function openAlbum(albumId: string) {
    router.push(albumDetailRoute(albumId))
  }

  return {
    queue,
    importing,
    isQueued,
    toggle,
    remove,
    clear,
    clearFinished,
    importAll,
    openAlbum,
  }
}
