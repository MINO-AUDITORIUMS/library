"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type { EditableAlbumTrack } from "@/lib/catalog/db/album-tracks"
import {
  formatDurationInput,
  parseDurationInput,
} from "@/lib/catalog/track-duration"

export type EditorTrack = {
  key: string
  title: string
  duration: string
  writers: string
  producers: string
  youtubeVideoId: string | null
  videoSource: string | null
  videoConfirmed: boolean
  musicbrainzRecordingId: string | null
}

export type EditorTrackField = "title" | "duration" | "writers" | "producers"

function createKey() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `track-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function toEditorTrack(track: EditableAlbumTrack): EditorTrack {
  return {
    key: createKey(),
    title: track.title,
    duration: formatDurationInput(track.durationSeconds),
    writers: track.writers.join(", "),
    producers: track.producers.join(", "),
    youtubeVideoId: track.youtubeVideoId,
    videoSource: track.videoSource,
    videoConfirmed: track.videoConfirmed,
    musicbrainzRecordingId: track.musicbrainzRecordingId,
  }
}

function splitCredits(value: string) {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
}

export function useTracklistEditor(albumId: string) {
  const router = useRouter()
  const [tracks, setTracks] = useState<EditorTrack[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/albums/${albumId}/tracks`)
      const data = (await response.json()) as {
        tracks?: EditableAlbumTrack[]
        error?: string
      }
      if (data.tracks) {
        setTracks(data.tracks.map(toEditorTrack))
      } else {
        toast.error(data.error ?? "Impossible de charger la tracklist.")
      }
    } catch {
      toast.error("Erreur réseau lors du chargement.")
    } finally {
      setLoading(false)
    }
  }, [albumId])

  const patchTrack = useCallback(
    (key: string, field: EditorTrackField, value: string) => {
      setTracks((prev) =>
        prev.map((track) =>
          track.key === key ? { ...track, [field]: value } : track
        )
      )
    },
    []
  )

  const removeTrack = useCallback((key: string) => {
    setTracks((prev) => prev.filter((track) => track.key !== key))
  }, [])

  const moveTrack = useCallback((key: string, direction: -1 | 1) => {
    setTracks((prev) => {
      const index = prev.findIndex((track) => track.key === key)
      const target = index + direction
      if (index < 0 || target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }, [])

  const addTrack = useCallback(() => {
    setTracks((prev) => [
      ...prev,
      {
        key: createKey(),
        title: "",
        duration: "",
        writers: "",
        producers: "",
        youtubeVideoId: null,
        videoSource: null,
        videoConfirmed: false,
        musicbrainzRecordingId: null,
      },
    ])
  }, [])

  const save = useCallback(
    async (onDone: () => void) => {
      const cleaned = tracks.filter((track) => track.title.trim().length > 0)
      if (cleaned.length !== tracks.length) {
        toast.error("Chaque piste doit avoir un titre.")
        return
      }

      setSaving(true)
      try {
        const payload = {
          tracks: cleaned.map((track) => ({
            title: track.title.trim(),
            durationSeconds: parseDurationInput(track.duration),
            writers: splitCredits(track.writers),
            producers: splitCredits(track.producers),
            youtubeVideoId: track.youtubeVideoId,
            videoSource: track.videoSource,
            videoConfirmed: track.videoConfirmed,
            musicbrainzRecordingId: track.musicbrainzRecordingId,
          })),
        }

        const response = await fetch(`/api/albums/${albumId}/tracks`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        const data = (await response.json()) as { error?: string }

        if (!response.ok) {
          toast.error(data.error ?? "Impossible de mettre à jour la tracklist.")
          return
        }

        toast.success("Tracklist mise à jour.")
        onDone()
        router.refresh()
      } catch {
        toast.error("Erreur réseau lors de l'enregistrement.")
      } finally {
        setSaving(false)
      }
    },
    [albumId, router, tracks]
  )

  return {
    tracks,
    loading,
    saving,
    load,
    patchTrack,
    removeTrack,
    moveTrack,
    addTrack,
    save,
  }
}
