"use client"

import { useEffect, useRef, useState } from "react"
import { UsersRoundIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
} from "@/components/ui/popover"

export type TrackCreditsPopoverProps = {
  trackTitle: string
  writers: string[]
  producers: string[]
}

const HOVER_OPEN_MS = 150
const HOVER_CLOSE_MS = 80

function CreditSection({ label, names }: { label: string; names: string[] }) {
  if (names.length === 0) return null

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm leading-snug wrap-break-word">{names.join(", ")}</p>
    </div>
  )
}

export function TrackCreditsPopover({
  trackTitle,
  writers,
  producers,
}: TrackCreditsPopoverProps) {
  const [open, setOpen] = useState(false)
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function clearTimers() {
    if (openTimer.current) clearTimeout(openTimer.current)
    if (closeTimer.current) clearTimeout(closeTimer.current)
    openTimer.current = null
    closeTimer.current = null
  }

  useEffect(() => () => clearTimers(), [])

  function scheduleOpen() {
    clearTimers()
    openTimer.current = setTimeout(() => setOpen(true), HOVER_OPEN_MS)
  }

  function scheduleClose() {
    clearTimers()
    closeTimer.current = setTimeout(() => setOpen(false), HOVER_CLOSE_MS)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 shrink-0 gap-1 px-2 text-xs text-muted-foreground"
          onMouseEnter={scheduleOpen}
          onMouseLeave={scheduleClose}
          tabIndex={-1}
        >
          <UsersRoundIcon className="size-3" />
          Crédits
        </Button>
      </PopoverAnchor>
      <PopoverContent
        align="start"
        className="w-80 gap-3"
        onMouseEnter={scheduleOpen}
        onMouseLeave={scheduleClose}
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <PopoverHeader className="gap-0.5">
          <PopoverTitle className="text-sm">Crédits</PopoverTitle>
          <p className="truncate text-xs text-muted-foreground">{trackTitle}</p>
        </PopoverHeader>
        <CreditSection label="Écriture" names={writers} />
        <CreditSection label="Production" names={producers} />
      </PopoverContent>
    </Popover>
  )
}

