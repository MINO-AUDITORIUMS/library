import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { AlbumDetailView } from "@/app/bibliotheque/_components/album-detail-view"
import { getAlbumDetailById } from "@/lib/catalog/db/albums"
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
  const supabase = await createClient()
  const album = await getAlbumDetailById(supabase, id)
  if (!album) notFound()
  return <AlbumDetailView album={album} />
}
