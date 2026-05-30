import type { Metadata } from "next"

import { ArtistsPageClient } from "@/app/artistes/_components/artists-page-client"
import { listArtistSummaries } from "@/lib/catalog/db/artists"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Artistes",
}

export default async function ArtistesPage() {
  const supabase = await createClient()
  const artists = await listArtistSummaries(supabase)
  return <ArtistsPageClient initialArtists={artists} />
}
