import type { Metadata } from "next"

import { AlbumEditForm } from "@/app/bibliotheque/_components/album-edit-form"
import { AlbumNotFoundView } from "@/app/bibliotheque/_components/album-not-found-view"
import { getAlbumDetailById } from "@/lib/catalog/db/albums"
import { requireAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import { createClient } from "@/lib/supabase/server"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const album = await getAlbumDetailById(supabase, id)
  return { title: album ? `Modifier · ${album.title}` : "Album introuvable" }
}

export default async function AlbumEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireAuthenticatedUser()

  const supabase = await createClient()
  const album = await getAlbumDetailById(supabase, id)

  if (!album) {
    return <AlbumNotFoundView />
  }

  return <AlbumEditForm album={album} />
}
