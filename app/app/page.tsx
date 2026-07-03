import type { Metadata } from "next"
import { Suspense } from "react"

import { HomePageClient } from "@/app/app/_components/home-page-client"
import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import { getHomeDashboardData } from "@/lib/catalog/db/home-dashboard"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Accueil",
}

export default async function AppPage() {
  const supabase = await createClient()
  const [session, dashboard] = await Promise.all([
    getAuthenticatedUser(),
    getHomeDashboardData(supabase),
  ])

  const email = session?.email ?? ""

  return (
    <Suspense>
      <HomePageClient email={email} {...dashboard} />
    </Suspense>
  )
}
