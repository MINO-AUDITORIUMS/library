"use client"

import { useCallback, useMemo, useState } from "react"

import { addDays, toDateKey } from "@/lib/programmation/dates"
import {
  formatMinutesAsTime,
  snapMinutes,
} from "@/lib/programmation/duration"
import {
  GRID_END_MINUTES,
  GRID_START_MINUTES,
} from "@/lib/programmation/constants"
import { summarizePeriod } from "@/lib/programmation/session-stats"
import type {
  PlanningDisplayMode,
  PlanningView,
  ProgrammationAlbumRef,
  ProgrammationSession,
  SessionDraft,
  SessionStatus,
} from "@/lib/programmation/types"

async function readApiError(response: Response) {
  try {
    const body = (await response.json()) as { error?: string }
    return body.error ?? "Une erreur est survenue."
  } catch {
    return "Une erreur est survenue."
  }
}

export type UseProgrammationOptions = {
  initialSessions: ProgrammationSession[]
}

export function useProgrammation({ initialSessions }: UseProgrammationOptions) {
  const [sessions, setSessions] = useState(initialSessions)
  const [view, setView] = useState<PlanningView>("week")
  const [displayMode, setDisplayMode] = useState<PlanningDisplayMode>("visual")
  const [anchorDate, setAnchorDate] = useState(() => new Date())

  const refreshSessions = useCallback(async () => {
    const response = await fetch("/api/programmation/sessions")
    if (!response.ok) {
      throw new Error(await readApiError(response))
    }
    const body = (await response.json()) as { sessions: ProgrammationSession[] }
    setSessions(body.sessions)
  }, [])

  const goToday = useCallback(() => setAnchorDate(new Date()), [])

  const goPrevious = useCallback(() => {
    setAnchorDate((current) => {
      if (view === "week") return addDays(current, -7)
      return new Date(current.getFullYear(), current.getMonth() - 1, 1)
    })
  }, [view])

  const goNext = useCallback(() => {
    setAnchorDate((current) => {
      if (view === "week") return addDays(current, 7)
      return new Date(current.getFullYear(), current.getMonth() + 1, 1)
    })
  }, [view])

  const addSession = useCallback(
    async (draft: SessionDraft) => {
      if (!draft.album) return null

      const response = await fetch("/api/programmation/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          albumId: draft.album.albumId,
          date: draft.date,
          startTime: draft.startTime,
          notes: draft.notes,
          status: draft.status,
        }),
      })

      if (!response.ok) {
        throw new Error(await readApiError(response))
      }

      const body = (await response.json()) as { session: ProgrammationSession }
      setSessions((current) => [...current, body.session])
      return body.session
    },
    []
  )

  const updateSession = useCallback(
    async (
      sessionId: string,
      patch: Partial<
        Pick<
          ProgrammationSession,
          "date" | "startTime" | "notes" | "status" | "durationMinutes"
        >
      > & { album?: ProgrammationAlbumRef }
    ) => {
      const previous = sessions
      setSessions((current) =>
        current.map((session) => {
          if (session.id !== sessionId) return session

          const album = patch.album ?? session.album
          return {
            ...session,
            ...patch,
            album,
            durationMinutes:
              patch.album?.durationMinutes ??
              patch.durationMinutes ??
              session.durationMinutes,
          }
        })
      )

      const response = await fetch(`/api/programmation/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          albumId: patch.album?.albumId,
          date: patch.date,
          startTime: patch.startTime,
          notes: patch.notes,
          status: patch.status,
        }),
      })

      if (!response.ok) {
        setSessions(previous)
        throw new Error(await readApiError(response))
      }

      const body = (await response.json()) as { session: ProgrammationSession }
      setSessions((current) =>
        current.map((session) =>
          session.id === sessionId ? body.session : session
        )
      )
    },
    [sessions]
  )

  const removeSession = useCallback(
    async (sessionId: string) => {
      const previous = sessions
      setSessions((current) =>
        current.filter((session) => session.id !== sessionId)
      )

      const response = await fetch(`/api/programmation/sessions/${sessionId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        setSessions(previous)
        throw new Error(await readApiError(response))
      }
    },
    [sessions]
  )

  const moveSession = useCallback(
    async (sessionId: string, date: string, startTime: string) => {
      await updateSession(sessionId, { date, startTime })
    },
    [updateSession]
  )

  const moveSessionFromPointer = useCallback(
    async (sessionId: string, date: string, offsetY: number) => {
      const rawMinutes = GRID_START_MINUTES + Math.round(offsetY / 2)
      const snapped = snapMinutes(
        Math.min(Math.max(rawMinutes, GRID_START_MINUTES), GRID_END_MINUTES - 15)
      )
      await moveSession(sessionId, date, formatMinutesAsTime(snapped))
    },
    [moveSession]
  )

  const duplicateSession = useCallback(
    async (sessionId: string) => {
      const source = sessions.find((session) => session.id === sessionId)
      if (!source) return

      const [hours, minutes] = source.startTime.split(":").map(Number)
      const nextStart = formatMinutesAsTime(
        snapMinutes(hours * 60 + minutes + source.durationMinutes + 15)
      )

      await addSession({
        album: source.album,
        date: source.date,
        startTime: nextStart,
        notes: source.notes,
        status: "brouillon",
      })
    },
    [addSession, sessions]
  )

  const summary = useMemo(
    () => summarizePeriod(sessions, view, anchorDate),
    [anchorDate, sessions, view]
  )

  return {
    sessions,
    view,
    displayMode,
    anchorDate,
    summary,
    setAnchorDate,
    updateView: setView,
    updateDisplayMode: setDisplayMode,
    goToday,
    goPrevious,
    goNext,
    addSession,
    updateSession,
    removeSession,
    moveSession,
    moveSessionFromPointer,
    duplicateSession,
    refreshSessions,
  }
}

export type ProgrammationController = ReturnType<typeof useProgrammation>

export function defaultSessionDraft(
  date = toDateKey(new Date()),
  startTime = "14:00"
): SessionDraft {
  return {
    album: null,
    date,
    startTime,
    notes: "",
    status: "brouillon",
  }
}

export type { SessionStatus }
