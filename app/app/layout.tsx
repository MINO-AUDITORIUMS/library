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
import { getEmailDomain, isAllowedEmail } from "@/lib/auth/allowed-domains"
import { routes } from "@/lib/routes"
import { createClient } from "@/lib/supabase/server"

import { UserFooter } from "@/app/app/user-footer"

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
    const message = domain
      ? `Domaine non autorisé (${domain}).`
      : "Email manquant ou invalide."
    redirect(`${routes.connexion}?authError=${encodeURIComponent(message)}`)
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
