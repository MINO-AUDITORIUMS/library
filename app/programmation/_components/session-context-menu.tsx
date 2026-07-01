 "use client"
 
 import type { ReactNode } from "react"
import { ExternalLinkIcon, Trash2Icon } from "lucide-react"
 
 import {
   ContextMenu,
   ContextMenuContent,
   ContextMenuItem,
   ContextMenuSeparator,
   ContextMenuTrigger,
 } from "@/components/ui/context-menu"
 
 export type SessionContextMenuProps = {
   onOpenDetails: () => void
   onDelete: () => void
   children: ReactNode
 }
 
 export function SessionContextMenu({
   onOpenDetails,
   onDelete,
   children,
 }: SessionContextMenuProps) {
   return (
     <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuItem
          onPointerDownCapture={(event) => {
            event.preventDefault()
            event.stopPropagation()
          }}
          onSelect={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onOpenDetails()
          }}
        >
          <ExternalLinkIcon className="size-4 opacity-80" />
          Ouvrir les détails
        </ContextMenuItem>
         <ContextMenuSeparator />
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
