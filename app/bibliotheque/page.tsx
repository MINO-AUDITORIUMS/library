import type { Metadata } from "next"
import { Suspense } from "react"

import { LibraryPageClient } from "@/app/bibliotheque/_components/library-page-client"
import { listAlbumSummaries } from "@/lib/catalog/db/albums"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Bibliothèque",
}

export default async function BibliothequePage() {
  const supabase = await createClient()
  const albums = await listAlbumSummaries(supabase)
  return (
    <Suspense>
      <LibraryPageClient initialAlbums={albums} />
    </Suspense>
  )
}
