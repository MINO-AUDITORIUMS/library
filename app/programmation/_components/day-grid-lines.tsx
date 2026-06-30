import {
  GRID_END_HOUR,
  GRID_HEIGHT_PX,
  GRID_START_HOUR,
  PIXELS_PER_MINUTE,
} from "@/lib/programmation/constants"

const hours = Array.from(
  { length: GRID_END_HOUR - GRID_START_HOUR + 1 },
  (_, index) => GRID_START_HOUR + index
)

export function DayGridLines() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{ height: GRID_HEIGHT_PX }}
    >
      {hours.map((hour) => {
        const top = (hour - GRID_START_HOUR) * 60 * PIXELS_PER_MINUTE
        return (
          <div
            key={hour}
            className="absolute right-0 left-0 border-t border-border/50"
            style={{ top }}
          />
        )
      })}
    </div>
  )
}
