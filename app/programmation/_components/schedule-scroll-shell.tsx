import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export type ScheduleScrollShellProps = {
  header: ReactNode
  children: ReactNode
  minWidth?: number
  className?: string
  contentClassName?: string
}

export function ScheduleScrollShell({
  header,
  children,
  minWidth,
  className,
  contentClassName,
}: ScheduleScrollShellProps) {
  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card",
        className
      )}
    >
      <div className="shrink-0 border-b bg-card px-3 py-3">{header}</div>
      <div className="flex min-h-0 flex-1 flex-col overflow-x-auto overflow-y-auto">
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col p-3 pt-2",
            contentClassName
          )}
          style={minWidth != null ? { minWidth } : undefined}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
