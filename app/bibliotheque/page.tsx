import type { Metadata } from "next"

import { LibraryPageClient } from "@/app/bibliotheque/_components/library-page-client"

export const metadata: Metadata = {
  title: "Bibliothèque",
}

export default function BibliothequePage() {
  return <LibraryPageClient />
}
