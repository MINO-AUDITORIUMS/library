import type { Metadata } from "next"
import { Suspense } from "react"

import { HomePageClient } from "@/app/app/_components/home-page-client"
import { getHomeDashboardData } from "@/lib/catalog/db/home-dashboard"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Accueil",
}

export default async function AppPage() {
  const supabase = await createClient()
  const [{ data, error }, dashboard] = await Promise.all([
    supabase.auth.getUser(),
    getHomeDashboardData(supabase),
  ])

  const email = !error && data.user?.email ? data.user.email : ""

  return (
    <Suspense>
      <HomePageClient email={email} {...dashboard} />
    </Suspense>
  )
}
