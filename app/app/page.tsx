import { Suspense } from "react"

import { createClient } from "@/lib/supabase/server"
import { WelcomeClient } from "./welcome-client"

export default async function AppPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  const email = !error && data.user?.email ? data.user.email : ""

  return (
    <Suspense>
      <WelcomeClient email={email} />
    </Suspense>
  )
}

