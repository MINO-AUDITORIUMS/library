import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"

import { ArtistDetailView } from "@/app/artistes/_components/artist-detail-view"
import { Button } from "@/components/ui/button"
import { getArtistDetailById } from "@/lib/catalog/db/artist-detail"
import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import { routes } from "@/lib/routes"
import { createClient } from "@/lib/supabase/server"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const artist = await getArtistDetailById(supabase, id)
  return {
    title: artist?.name ?? "Artiste",
  }
}

export default async function ArtistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getAuthenticatedUser()
  if (!session) notFound()

  const supabase = await createClient()
  const artist = await getArtistDetailById(supabase, id)
  if (!artist) notFound()

  return (
    <div className="flex w-full flex-col gap-6">
      <Button variant="ghost" size="sm" className="w-fit" asChild>
        <Link href={routes.artistes}>
          <ArrowLeftIcon />
          Artistes
        </Link>
      </Button>
      <ArtistDetailView artist={artist} />
    </div>
  )
}
