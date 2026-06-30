export const GRID_START_HOUR = 9
export const GRID_END_HOUR = 22
export const PIXELS_PER_MINUTE = 2
export const TIME_SNAP_MINUTES = 15

export const GRID_START_MINUTES = GRID_START_HOUR * 60
export const GRID_END_MINUTES = GRID_END_HOUR * 60
export const GRID_HEIGHT_PX =
  (GRID_END_MINUTES - GRID_START_MINUTES) * PIXELS_PER_MINUTE

export const TIME_GUTTER_WIDTH_PX = 48

export const PENDING_ALBUM_KEY = "mino-programmation-pending-album"

export const SESSION_STATUS_LABELS = {
  brouillon: "Brouillon",
  confirmee: "Confirmée",
  passee: "Passée",
  annulee: "Annulée",
} as const
