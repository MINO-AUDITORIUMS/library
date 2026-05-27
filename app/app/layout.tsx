import { redirect } from "next/navigation"

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
import { routes } from "@/lib/routes"
import { createClient } from "@/lib/supabase/server"

import { UserFooter } from "@/app/app/user-footer"

const ALLOWED_DOMAINS = ["mino.co", "pm.me"] as const

function getEmailDomain(email: string) {
  const at = email.lastIndexOf("@")
  if (at < 0) return null
  const domain = email
    .slice(at + 1)
    .trim()
    .toLowerCase()
  return domain.length ? domain : null
}

function isAllowedEmail(email: string) {
  const domain = getEmailDomain(email)
  if (!domain) return false
  return ALLOWED_DOMAINS.includes(domain as (typeof ALLOWED_DOMAINS)[number])
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    redirect(routes.connexion)
  }

  const email = data.user.email
  if (!email || !isAllowedEmail(email)) {
    await supabase.auth.signOut()
    const domain = email ? getEmailDomain(email) : null
    const redirectUrl = new URL(routes.connexion, "http://localhost:3000")
    redirectUrl.searchParams.set(
      "authError",
      domain
        ? `Domaine non autorisé (${domain}).`
        : "Email manquant ou invalide."
    )
    redirect(redirectUrl.pathname + redirectUrl.search)
  }

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
            <SidebarTrigger />
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
