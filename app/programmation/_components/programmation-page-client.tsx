"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

import { ProgrammationMonthView } from "@/app/programmation/_components/programmation-month-view"
import { ProgrammationToolbar } from "@/app/programmation/_components/programmation-toolbar"
import { ProgrammationWeekView } from "@/app/programmation/_components/programmation-week-view"
import { SessionDetailSheet } from "@/app/programmation/_components/session-detail-sheet"
import { SessionFormDialog } from "@/app/programmation/_components/session-form-dialog"
import {
  defaultSessionDraft,
  useProgrammation,
} from "@/hooks/use-programmation"
import {
  GRID_END_MINUTES,
  GRID_START_MINUTES,
  PIXELS_PER_MINUTE,
  TIME_SNAP_MINUTES,
} from "@/lib/programmation/constants"
import { consumePendingAlbum } from "@/lib/programmation/pending-album"
import { parseTimeToMinutes, snapMinutes } from "@/lib/programmation/duration"
import type {
  ProgrammationSession,
  SessionDraft,
} from "@/lib/programmation/types"

export type ProgrammationPageClientProps = {
  initialSessions: ProgrammationSession[]
}

export function ProgrammationPageClient({
  initialSessions,
}: ProgrammationPageClientProps) {
  const controller = useProgrammation({ initialSessions })
  const [draggingSession, setDraggingSession] = useState<{
    id: string
    grabOffsetY: number
    pointerId: number
  } | null>(null)
  const [dragIndicator, setDragIndicator] = useState<{
    dateKey: string
    top: number
  } | null>(null)
  const dragIndicatorRef = useRef<{ dateKey: string; top: number } | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [draft, setDraft] = useState<SessionDraft>(defaultSessionDraft())
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const suppressSelectRef = useRef<{ id: string; until: number } | null>(null)

  const selectedSession = useMemo(
    () => controller.sessions.find((session) => session.id === selectedSessionId) ?? null,
    [controller.sessions, selectedSessionId]
  )

  const openDetails = useCallback((sessionId: string) => {
    const suppress = suppressSelectRef.current
    if (suppress && suppress.id === sessionId && Date.now() < suppress.until) {
      suppressSelectRef.current = null
      return
    }

    setSelectedSessionId(sessionId)
    setDetailOpen(true)
  }, [])

  const openCreateForm = useCallback((dateKey: string, startTime: string) => {
    setDraft(defaultSessionDraft(dateKey, startTime))
    setFormOpen(true)
  }, [])

  useEffect(() => {
    const pending = consumePendingAlbum()
    if (!pending) return

    setDraft({
      album: pending,
      date: defaultSessionDraft().date,
      startTime: "14:00",
      notes: "",
      status: "brouillon",
    })
    setFormOpen(true)
  }, [])

  async function handleCreate() {
    if (!draft.album) {
      toast.error("Choisis un album pour programmer la séance.")
      return
    }

    setSubmitting(true)
    try {
      await controller.addSession(draft)
      setFormOpen(false)
      toast.success(`« ${draft.album.title} » ajouté au planning.`)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Impossible d'ajouter la séance."
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    dragIndicatorRef.current = dragIndicator
  }, [dragIndicator])

  useEffect(() => {
    if (!draggingSession) return
    const active = draggingSession

    function findDropZone(clientX: number, clientY: number) {
      const element = document.elementFromPoint(clientX, clientY)
      const zone = element?.closest?.("[data-datekey]") as HTMLElement | null
      if (!zone) return null
      const dateKey = zone.getAttribute("data-datekey")
      if (!dateKey) return null
      return { zone, dateKey }
    }

    function onPointerMove(event: PointerEvent) {
      if (event.pointerId !== active.pointerId) return
      const hit = findDropZone(event.clientX, event.clientY)
      if (!hit) {
        setDragIndicator(null)
        return
      }

      const rect = hit.zone.getBoundingClientRect()
      const rawOffsetY = event.clientY - rect.top - active.grabOffsetY
      const rawMinutes =
        GRID_START_MINUTES + Math.round(rawOffsetY / PIXELS_PER_MINUTE)
      const clamped = Math.min(
        Math.max(rawMinutes, GRID_START_MINUTES),
        GRID_END_MINUTES - TIME_SNAP_MINUTES
      )
      const snapped = snapMinutes(clamped, TIME_SNAP_MINUTES)
      const top = (snapped - GRID_START_MINUTES) * PIXELS_PER_MINUTE
      setDragIndicator({ dateKey: hit.dateKey, top })
    }

    async function onPointerUp(event: PointerEvent) {
      if (event.pointerId !== active.pointerId) return
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", onPointerUp)
      const indicator = dragIndicatorRef.current
      suppressSelectRef.current = { id: active.id, until: Date.now() + 1200 }
      setDraggingSession(null)
      setDragIndicator(null)

      if (!indicator) return
      const currentSession = controller.sessions.find(
        (session) => session.id === active.id
      )
      if (currentSession) {
        const currentTop =
          (parseTimeToMinutes(currentSession.startTime) - GRID_START_MINUTES) *
          PIXELS_PER_MINUTE
        const sameSlot =
          currentSession.date === indicator.dateKey &&
          Math.abs(currentTop - indicator.top) < 0.5
        if (sameSlot) return
      }

      try {
        await controller.moveSessionFromPointer(
          active.id,
          indicator.dateKey,
          indicator.top
        )
        toast.success("Séance déplacée.")
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Impossible de déplacer la séance."
        toast.error(message)
      }
    }

    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerup", onPointerUp, { once: true })
    return () => {
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", onPointerUp)
    }
  }, [controller, draggingSession])

  async function handleUpdate(
    ...args: Parameters<typeof controller.updateSession>
  ) {
    try {
      await controller.updateSession(...args)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Impossible de mettre à jour la séance."
      toast.error(message)
    }
  }

  async function handleDelete(sessionId: string) {
    try {
      await controller.removeSession(sessionId)
      onOpenChangeDetail(false)
      toast.success("Séance retirée du planning.")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Impossible de retirer la séance."
      toast.error(message)
    }
  }

  async function handleDuplicate(sessionId: string) {
    try {
      await controller.duplicateSession(sessionId)
      toast.success("Séance dupliquée.")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Impossible de dupliquer la séance."
      toast.error(message)
    }
  }

  function onOpenChangeDetail(open: boolean) {
    setDetailOpen(open)
    if (!open) setSelectedSessionId(null)
  }

  return (
    <div className="flex h-[calc(100svh-5rem)] flex-col gap-6 overflow-hidden md:h-[calc(100svh-6rem)]">
      <div className="shrink-0">
        <ProgrammationToolbar
          view={controller.view}
          displayMode={controller.displayMode}
          anchorDate={controller.anchorDate}
          summary={controller.summary}
          onViewChange={controller.updateView}
          onDisplayModeChange={controller.updateDisplayMode}
          onPrevious={controller.goPrevious}
          onNext={controller.goNext}
          onToday={controller.goToday}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {controller.view === "week" ? (
        <ProgrammationWeekView
          anchorDate={controller.anchorDate}
          sessions={controller.sessions}
          displayMode={controller.displayMode}
          onEmptySlot={openCreateForm}
          onSelectSession={openDetails}
          onDragSessionStart={(sessionId, grabOffsetY, pointerId) =>
            setDraggingSession({ id: sessionId, grabOffsetY, pointerId })
          }
          dragging={draggingSession != null}
          dragIndicator={dragIndicator}
          onDeleteSession={handleDelete}
        />
      ) : null}

      {controller.view === "month" ? (
        <ProgrammationMonthView
          anchorDate={controller.anchorDate}
          sessions={controller.sessions}
          onEmptySlot={openCreateForm}
          onSelectSession={openDetails}
          onDeleteSession={handleDelete}
        />
      ) : null}
      </div>

      <SessionFormDialog
        open={formOpen}
        draft={draft}
        submitting={submitting}
        onOpenChange={setFormOpen}
        onDraftChange={setDraft}
        onSubmit={handleCreate}
      />

      <SessionDetailSheet
        session={selectedSession}
        open={detailOpen}
        onOpenChange={onOpenChangeDetail}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
      />
    </div>
  )
}
