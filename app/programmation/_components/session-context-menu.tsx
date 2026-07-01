"use client"

import type { ReactNode } from "react"
import { Trash2Icon } from "lucide-react"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

export type SessionContextMenuProps = {
  onDelete: () => void
  children: ReactNode
}

export function SessionContextMenu({
  onDelete,
  children,
}: SessionContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuItem
          variant="destructive"
          onPointerDownCapture={(event) => {
            event.preventDefault()
            event.stopPropagation()
          }}
          onSelect={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onDelete()
          }}
        >
          <Trash2Icon className="size-4 opacity-80" />
          Retirer du planning
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
