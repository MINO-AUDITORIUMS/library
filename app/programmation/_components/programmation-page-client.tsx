"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import { ProgrammationDayView } from "@/app/programmation/_components/programmation-day-view"
import { ProgrammationMonthView } from "@/app/programmation/_components/programmation-month-view"
import { ProgrammationToolbar } from "@/app/programmation/_components/programmation-toolbar"
import { ProgrammationWeekView } from "@/app/programmation/_components/programmation-week-view"
import { SessionDetailSheet } from "@/app/programmation/_components/session-detail-sheet"
import { SessionFormDialog } from "@/app/programmation/_components/session-form-dialog"
import {
  defaultSessionDraft,
  useProgrammation,
} from "@/hooks/use-programmation"
import { consumePendingAlbum } from "@/lib/programmation/pending-album"
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
  const [draggingSessionId, setDraggingSessionId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [draft, setDraft] = useState<SessionDraft>(defaultSessionDraft())
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const selectedSession = useMemo(
    () => controller.sessions.find((session) => session.id === selectedSessionId) ?? null,
    [controller.sessions, selectedSessionId]
  )

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

  async function handleDrop(dateKey: string, offsetY: number) {
    if (!draggingSessionId) return

    try {
      await controller.moveSessionFromPointer(draggingSessionId, dateKey, offsetY)
      setDraggingSessionId(null)
      toast.success("Séance déplacée.")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Impossible de déplacer la séance."
      toast.error(message)
    }
  }

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
          onSelectSession={(sessionId) => {
            setSelectedSessionId(sessionId)
            setDetailOpen(true)
          }}
          onDragSessionStart={setDraggingSessionId}
          onDropSession={handleDrop}
        />
      ) : null}

      {controller.view === "day" ? (
        <ProgrammationDayView
          anchorDate={controller.anchorDate}
          sessions={controller.sessions}
          displayMode={controller.displayMode}
          onEmptySlot={openCreateForm}
          onSelectSession={(sessionId) => {
            setSelectedSessionId(sessionId)
            setDetailOpen(true)
          }}
          onDragSessionStart={setDraggingSessionId}
          onDropSession={handleDrop}
        />
      ) : null}

      {controller.view === "month" ? (
        <ProgrammationMonthView
          anchorDate={controller.anchorDate}
          sessions={controller.sessions}
          onEmptySlot={openCreateForm}
          onSelectSession={(sessionId) => {
            setSelectedSessionId(sessionId)
            setDetailOpen(true)
          }}
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
