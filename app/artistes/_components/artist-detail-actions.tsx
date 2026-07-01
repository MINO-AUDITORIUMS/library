"use client"

import Link from "next/link"
import { PencilIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { artistEditRoute } from "@/lib/routes"

export type ArtistDetailActionsProps = {
  artistId: string
}

export function ArtistDetailActions({ artistId }: ArtistDetailActionsProps) {
  return (
    <Button variant="outline" size="sm" asChild>
      <Link href={artistEditRoute(artistId)}>
        <PencilIcon />
        Modifier
      </Link>
    </Button>
  )
}
