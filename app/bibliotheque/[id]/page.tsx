import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { AlbumDetailView } from "@/app/bibliotheque/_components/album-detail-view"
import { getAlbumRatingsSnapshot } from "@/lib/catalog/db/album-user-ratings"
import { listAlbumComments } from "@/lib/catalog/db/album-comments"
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
    title: album?.title ?? "Album",
  }
}

export default async function AlbumDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getAuthenticatedUser()
  if (!session) notFound()

  const supabase = await createClient()
  const [album, comments, albumRatings] = await Promise.all([
    getAlbumDetailById(supabase, id),
    listAlbumComments(supabase, id),
    getAlbumRatingsSnapshot(supabase, id, session.user.id),
  ])

  if (!album) notFound()

  return (
    <AlbumDetailView
      album={album}
      comments={comments}
      currentUserId={session.user.id}
      currentUserEmail={session.email}
      albumRatings={albumRatings}
    />
  )
}
