"use client"

import { useEffect, useRef, useState } from "react"

import { AlbumCommentsSection } from "@/app/bibliotheque/_components/album-comments-section"
import { AlbumTracklistCard } from "@/app/bibliotheque/_components/album-tracklist-card"
import type { AlbumComment, AlbumTrack } from "@/lib/catalog/types"

export type AlbumDetailSplitProps = {
  albumId: string
  albumTitle: string
  tracks: AlbumTrack[]
  comments: AlbumComment[]
  currentUserId: string
  currentUserEmail: string
}

export function AlbumDetailSplit({
  albumId,
  albumTitle,
  tracks,
  comments,
  currentUserId,
  currentUserEmail,
}: AlbumDetailSplitProps) {
  const tracklistRef = useRef<HTMLDivElement>(null)
  const [commentsMaxHeight, setCommentsMaxHeight] = useState<number>()

  useEffect(() => {
    const element = tracklistRef.current
    if (!element) return

    function syncHeight() {
      const isLarge = window.matchMedia("(min-width: 1024px)").matches
      setCommentsMaxHeight(isLarge ? element!.offsetHeight : undefined)
    }

    syncHeight()
    const observer = new ResizeObserver(syncHeight)
    observer.observe(element)
    window.addEventListener("resize", syncHeight)

    return () => {
      observer.disconnect()
      window.removeEventListener("resize", syncHeight)
    }
  }, [tracks.length, comments.length])

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <div ref={tracklistRef}>
        <AlbumTracklistCard
          albumId={albumId}
          albumTitle={albumTitle}
          tracks={tracks}
        />
      </div>

      <AlbumCommentsSection
        albumId={albumId}
        initialComments={comments}
        currentUserId={currentUserId}
        currentUserEmail={currentUserEmail}
        maxHeight={commentsMaxHeight}
      />
    </div>
  )
}
