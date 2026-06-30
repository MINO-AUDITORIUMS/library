import type { AlbumDetail, AlbumSummary } from "@/lib/catalog/types"
import { minutesFromSeconds } from "@/lib/programmation/duration"
import type { ProgrammationAlbumRef } from "@/lib/programmation/types"

export function albumSummaryToRef(
  summary: AlbumSummary,
  totalDurationSeconds = 0
): ProgrammationAlbumRef {
  return {
    albumId: summary.id,
    title: summary.title,
    artist: summary.artist,
    durationMinutes: minutesFromSeconds(totalDurationSeconds),
    coverHue: summary.coverHue,
    coverImageUrl: summary.coverImageUrl,
  }
}

export function albumDetailToRef(album: AlbumDetail): ProgrammationAlbumRef {
  return {
    albumId: album.id,
    title: album.title,
    artist: album.artist,
    durationMinutes: minutesFromSeconds(album.totalDurationSeconds),
    coverHue: album.coverHue,
    coverImageUrl: album.coverImageUrl,
  }
}
