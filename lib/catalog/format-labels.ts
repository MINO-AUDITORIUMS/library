import type { AlbumFormat } from "@/lib/catalog/types"

export const albumFormatLabels: Record<AlbumFormat, string> = {
  vinyl: "Vinyle",
  cd: "CD",
  cassette: "Cassette",
  digital: "Digital",
  other: "Autre",
}

export const albumFormatOptions: AlbumFormat[] = [
  "vinyl",
  "cd",
  "cassette",
  "digital",
  "other",
]
