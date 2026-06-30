import type { Metadata } from "next"

import { ProgrammationPageClient } from "@/app/programmation/_components/programmation-page-client"
import { listSessions } from "@/lib/programmation/db/sessions"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Programmation",
}

export default async function ProgrammationPage() {
  const supabase = await createClient()
  const sessions = await listSessions(supabase)

  return <ProgrammationPageClient initialSessions={sessions} />
}
