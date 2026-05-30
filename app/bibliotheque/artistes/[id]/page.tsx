import { redirect } from "next/navigation"

import { artistDetailRoute } from "@/lib/routes"

export default async function LegacyArtistRedirect({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(artistDetailRoute(id))
}
