import {
  GRID_END_HOUR,
  GRID_HEIGHT_PX,
  GRID_START_HOUR,
  PIXELS_PER_MINUTE,
} from "@/lib/programmation/constants"
import { formatMinutesAsTime } from "@/lib/programmation/duration"

const hours = Array.from(
  { length: GRID_END_HOUR - GRID_START_HOUR + 1 },
  (_, index) => GRID_START_HOUR + index
)

export function TimeGutter() {
  return (
    <div
      className="relative shrink-0"
      style={{ width: 48, height: GRID_HEIGHT_PX }}
    >
      {hours.map((hour) => {
        const top = (hour - GRID_START_HOUR) * 60 * PIXELS_PER_MINUTE
        return (
          <span
            key={hour}
            className="absolute right-1 -translate-y-1/2 text-[10px] text-muted-foreground tabular-nums"
            style={{ top }}
          >
            {formatMinutesAsTime(hour * 60)}
          </span>
        )
      })}
    </div>
  )
}
