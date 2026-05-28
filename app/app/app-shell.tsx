"use client"

import { Disc3Icon, HomeIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { UserFooter } from "@/app/app/user-footer"
import { AppBreadcrumb } from "@/components/app/app-breadcrumb"
import { MinoLogo } from "@/components/mino-logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { routes } from "@/lib/routes"

export type AppShellProps = {
  email: string
  children: React.ReactNode
}

const navItems = [
  { href: routes.app, label: "Accueil", icon: HomeIcon },
  { href: routes.bibliotheque, label: "Bibliothèque", icon: Disc3Icon },
] as const

export function AppShell({ email, children }: AppShellProps) {
  const pathname = usePathname()

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
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={
                        pathname === item.href ||
                        (item.href === routes.bibliotheque &&
                          pathname.startsWith("/bibliotheque"))
                      }
                      asChild
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <UserFooter email={email} />
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex min-h-svh flex-col">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4 md:px-6">
          <SidebarTrigger className="md:hidden" />
          <AppBreadcrumb />
        </header>
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
