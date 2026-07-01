"use client"

import { TrackAddClipDialog } from "@/components/catalog/track-add-clip-dialog"
import { TrackVideoDialog } from "@/components/catalog/track-video-dialog"
import type { AlbumTrack } from "@/lib/catalog/types"

export type TrackClipActionsProps = {
  albumId: string
  track: AlbumTrack
}

export function TrackClipActions({ albumId, track }: TrackClipActionsProps) {
  if (track.youtubeVideoId) {
    return (
      <TrackVideoDialog
        videoId={track.youtubeVideoId}
        trackTitle={track.title}
      />
    )
  }

  return (
    <TrackAddClipDialog
      albumId={albumId}
      position={track.position}
      trackTitle={track.title}
    />
  )
}
