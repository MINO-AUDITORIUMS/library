import { redirect } from "next/navigation"

import { routes } from "@/lib/routes"
import { createClient } from "@/lib/supabase/server"
import { WelcomeClient } from "./welcome-client"

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

export default async function AppPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
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

  const params = await searchParams
  const auth = params.auth
  const showSuccessToast = auth === "success"

  return (
    <WelcomeClient email={email} showSuccessToast={showSuccessToast} />
  )
}

