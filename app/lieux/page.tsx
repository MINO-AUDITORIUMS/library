import type { Metadata } from "next"

import { LocationsPageClient } from "@/app/lieux/_components/locations-page-client"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Lieux",
}

export default function LocationsPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Lieux</h1>
            <Badge variant="outline">WIP</Badge>
          </div>
        </div>
      </header>

      <LocationsPageClient />
    </div>
  )
}
