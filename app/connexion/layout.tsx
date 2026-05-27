import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { routes } from "@/lib/routes"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Connexion",
}

export default async function ConnexionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (data.user) {
    redirect(routes.app)
  }

  return children
}

