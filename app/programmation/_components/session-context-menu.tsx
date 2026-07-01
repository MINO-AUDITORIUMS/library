 "use client"
 
 import type { ReactNode } from "react"
 
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
           Retirer du planning
         </ContextMenuItem>
       </ContextMenuContent>
     </ContextMenu>
   )
 }
