"use client"

import { MinoLogo } from "@/components/mino-logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { UserFooter } from "@/app/app/user-footer"

export type AppShellProps = {
  email: string
  children: React.ReactNode
}

export function AppShell({ email, children }: AppShellProps) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center justify-between gap-2 px-2 py-2">
            <div className="flex items-center gap-2">
              <MinoLogo variant="mark" logoClassName="h-6" />
              <div className="min-w-0">
                <p className="truncate text-sm leading-none font-semibold">
                  Library
                </p>
              </div>
            </div>
            <SidebarTrigger className="md:hidden" />
          </div>
        </SidebarHeader>
        <SidebarContent />
        <SidebarFooter>
          <UserFooter email={email} />
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex items-center gap-2 border-b px-4 py-3">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1" />
        </header>
        <div className="p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
