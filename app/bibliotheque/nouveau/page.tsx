import type { Metadata } from "next"

import { AlbumCreateForm } from "@/app/bibliotheque/_components/album-create-form"

export const metadata: Metadata = {
  title: "Nouvel album",
}

export default function NouvelAlbumPage() {
  return <AlbumCreateForm />
}
