"use client"

import { CalendarDaysIcon, Disc3Icon, HomeIcon, Mic2Icon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { UserFooter } from "@/app/app/user-footer"
import { AppBreadcrumb } from "@/components/app/app-breadcrumb"
import { GlobalSearchCommand } from "@/components/app/global-search-command"
import { ThemeToggle } from "@/components/app/theme-toggle"
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
  {
    href: routes.app,
    label: "Accueil",
    icon: HomeIcon,
    match: "exact" as const,
  },
  {
    href: routes.bibliotheque,
    label: "Bibliothèque",
    icon: Disc3Icon,
    match: "bibliotheque" as const,
  },
  {
    href: routes.artistes,
    label: "Artistes",
    icon: Mic2Icon,
    match: "artistes" as const,
  },
  {
    href: routes.programmation,
    label: "Programmation",
    icon: CalendarDaysIcon,
    match: "programmation" as const,
  },
] as const

const libraryItems = navItems

function isNavActive(pathname: string, item: (typeof navItems)[number]) {
  switch (item.match) {
    case "exact":
      return pathname === item.href
    case "bibliotheque":
      return pathname.startsWith("/bibliotheque")
    case "artistes":
      return pathname.startsWith("/artistes")
    case "programmation":
      return pathname.startsWith("/programmation")
  }
}

export function AppShell({ email, children }: AppShellProps) {
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Link href={routes.app}>
            <MinoLogo variant="mark" logoClassName="h-12" />
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Librairie</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {libraryItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isNavActive(pathname, item)}
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
        <header className="grid h-12 shrink-0 grid-cols-[auto_1fr_auto] items-center gap-2 border-b px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <AppBreadcrumb />
          </div>
          <div className="flex justify-center">
            <GlobalSearchCommand />
          </div>
          <div className="flex shrink-0 items-center justify-end gap-2">
            <ThemeToggle />
          </div>
        </header>
        <div className="flex min-h-0 flex-1 flex-col p-4 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
