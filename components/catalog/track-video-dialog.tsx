"use client"

import { ExternalLinkIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { youTubeEmbedUrl, youTubeWatchUrl } from "@/lib/catalog/youtube"

export type TrackVideoDialogProps = {
  videoId: string
  trackTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TrackVideoDialog({
  videoId,
  trackTitle,
  open,
  onOpenChange,
}: TrackVideoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[calc(100%-2rem)] gap-0 overflow-hidden p-0 sm:max-w-4xl lg:max-w-5xl">
        <DialogHeader className="border-b p-4">
          <DialogTitle>{trackTitle}</DialogTitle>
        </DialogHeader>
        <div className="aspect-video w-full bg-black">
          <iframe
            src={youTubeEmbedUrl(videoId)}
            title={trackTitle}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
        <DialogFooter className="mx-0 mb-0 border-t p-4 pb-4">
          <Button variant="outline" size="sm" asChild>
            <a
              href={youTubeWatchUrl(videoId)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLinkIcon />
              Ouvrir sur YouTube
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
