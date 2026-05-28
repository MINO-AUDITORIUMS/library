import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { AlbumDetailView } from "@/app/bibliotheque/_components/album-detail-view"
import { getMockAlbumById } from "@/lib/catalog/mock-albums"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const album = getMockAlbumById(id)
  return {
    title: album ? album.title : "Album",
  }
}

export default async function AlbumDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const album = getMockAlbumById(id)
  if (!album) notFound()
  return <AlbumDetailView album={album} />
}
