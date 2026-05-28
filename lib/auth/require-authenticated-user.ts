import { redirect } from "next/navigation"

import { getEmailDomain, isAllowedEmail } from "@/lib/auth/allowed-domains"
import { routes } from "@/lib/routes"
import { createClient } from "@/lib/supabase/server"

export async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) return null

  const email = data.user.email
  if (!email || !isAllowedEmail(email)) return null

  return { user: data.user, email }
}

export async function requireAuthenticatedUser() {
  const session = await getAuthenticatedUser()

  if (!session) {
    redirect(routes.connexion)
  }

  return session
}
