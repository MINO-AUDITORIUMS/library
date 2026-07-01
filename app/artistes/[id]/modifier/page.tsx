import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ArtistEditForm } from "@/app/artistes/_components/artist-edit-form"
import { getArtistDetailById } from "@/lib/catalog/db/artist-detail"
import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
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
    title: artist ? `Modifier · ${artist.name}` : "Modifier l'artiste",
  }
}

export default async function ArtistEditPage({
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

  return <ArtistEditForm artist={artist} />
}
