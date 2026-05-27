import { createClient } from "@/lib/supabase/server"
import { WelcomeClient } from "./welcome-client"

export default async function AppPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  const email = !error && data.user?.email ? data.user.email : ""

  const params = await searchParams
  const auth = params.auth
  const showSuccessToast = auth === "success"

  return <WelcomeClient email={email} showSuccessToast={showSuccessToast} />
}

