import { redirect } from "next/navigation"

import { getEmailDomain, isAllowedEmail } from "@/lib/auth/allowed-domains"
import { routes } from "@/lib/routes"
import { createClient } from "@/lib/supabase/server"

import { AppShell } from "@/app/app/app-shell"

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

  return <AppShell email={email}>{children}</AppShell>
}
