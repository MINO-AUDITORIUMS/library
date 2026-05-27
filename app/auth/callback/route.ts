import { NextResponse } from "next/server"

import { routes } from "@/lib/routes"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const next = url.searchParams.get("next") ?? routes.app

  const oauthError =
    url.searchParams.get("error_description") ??
    url.searchParams.get("error") ??
    null

  if (!code) {
    const redirectUrl = new URL(routes.connexion, url.origin)
    redirectUrl.searchParams.set(
      "authError",
      oauthError ? oauthError.replace(/\+/g, " ") : "Connexion annulée ou invalide."
    )
    return NextResponse.redirect(redirectUrl)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    const redirectUrl = new URL(routes.connexion, url.origin)
    redirectUrl.searchParams.set("authError", error.message)
    return NextResponse.redirect(redirectUrl)
  }

  const redirectUrl = new URL(next, url.origin)
  redirectUrl.searchParams.set("auth", "success")
  return NextResponse.redirect(redirectUrl)
}

