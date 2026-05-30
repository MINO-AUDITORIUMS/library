import { AppShell } from "@/app/app/app-shell"
import { requireAuthenticatedUser } from "@/lib/auth/require-authenticated-user"

export default async function ArtistesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { email } = await requireAuthenticatedUser()
  return <AppShell email={email}>{children}</AppShell>
}
