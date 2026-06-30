import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export type ScheduleScrollShellProps = {
  header: ReactNode
  children: ReactNode
  minWidth?: number
  className?: string
}

export function ScheduleScrollShell({
  header,
  children,
  minWidth,
  className,
}: ScheduleScrollShellProps) {
  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card",
        className
      )}
    >
      <div className="shrink-0 border-b bg-card px-3 py-3">{header}</div>
      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
        <div
          className="p-3 pt-2"
          style={minWidth != null ? { minWidth } : undefined}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
