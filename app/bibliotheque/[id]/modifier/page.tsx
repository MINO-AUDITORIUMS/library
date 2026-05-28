import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { AlbumEditForm } from "@/app/bibliotheque/_components/album-edit-form"
import { getAlbumDetailById } from "@/lib/catalog/db/albums"
import { getAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import { createClient } from "@/lib/supabase/server"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const album = await getAlbumDetailById(supabase, id)
  return {
    title: album ? `Modifier · ${album.title}` : "Modifier l'album",
  }
}

export default async function AlbumEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getAuthenticatedUser()
  if (!session) notFound()

  const supabase = await createClient()
  const album = await getAlbumDetailById(supabase, id)
  if (!album) notFound()

  return <AlbumEditForm album={album} />
}
