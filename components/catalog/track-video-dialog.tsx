"use client"

import { ExternalLinkIcon, PlayIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { youTubeEmbedUrl, youTubeWatchUrl } from "@/lib/catalog/youtube"

export type TrackVideoDialogProps = {
  videoId: string
  trackTitle: string
}

export function TrackVideoDialog({
  videoId,
  trackTitle,
}: TrackVideoDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 shrink-0 gap-1 px-2 text-xs text-primary"
        >
          <PlayIcon className="size-3" />
          Vidéo
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-2xl">
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
        <DialogFooter className="-mx-0 -mb-0 border-t p-4 pb-4">
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
