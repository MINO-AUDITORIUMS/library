export type SessionStatus = "brouillon" | "confirmee" | "passee" | "annulee"

export type PlanningView = "day" | "week" | "month"

export type PlanningDisplayMode = "visual" | "text"

export type ProgrammationAlbumRef = {
  albumId: string
  title: string
  artist: string
  durationMinutes: number
  coverHue: number
  coverImageUrl: string | null
}

export type ProgrammationSession = {
  id: string
  album: ProgrammationAlbumRef
  date: string
  startTime: string
  durationMinutes: number
  notes: string
  status: SessionStatus
  createdAt: string
  updatedAt: string
}

export type SessionDraft = {
  album: ProgrammationAlbumRef | null
  date: string
  startTime: string
  notes: string
  status: SessionStatus
}

export type PeriodSummary = {
  totalMinutes: number
  sessionCount: number
  dayTotals: { date: string; minutes: number; count: number }[]
}
