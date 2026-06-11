import { musicBrainzFetch } from "@/lib/catalog/musicbrainz/client"
import type { MusicBrainzRecording } from "@/lib/catalog/musicbrainz/types"
import { parseYouTubeVideoId } from "@/lib/catalog/youtube"

export type MusicBrainzUrlRelation = {
  type?: string
  attributes?: string[]
  url?: { resource?: string }
  recording?: { id?: string }
}

function isFreeStreamingRelation(type: string) {
  return type.trim().toLowerCase() === "free streaming"
}

function hasVideoAttribute(attributes?: string[]) {
  return (attributes ?? []).some((attribute) => attribute.toLowerCase() === "video")
}

function isYouTubeResource(url: string) {
  try {
    const host = new URL(url).hostname.toLowerCase()
    return host.includes("youtube.com") || host.includes("youtu.be")
  } catch {
    return false
  }
}

function isOfficialYouTubeResource(url: string) {
  try {
    const host = new URL(url).hostname.toLowerCase()
    if (host === "music.youtube.com") return false
    return host.includes("youtube.com") || host.includes("youtu.be")
  } catch {
    return false
  }
}

export function extractYouTubeFromRelations(
  relations?: MusicBrainzUrlRelation[]
): string | null {
  if (!relations?.length) return null

  const streaming = relations.filter(
    (relation) =>
      relation.url?.resource &&
      isFreeStreamingRelation(relation.type ?? "") &&
      isYouTubeResource(relation.url.resource)
  )

  const pools = [
    streaming.filter(
      (relation) =>
        hasVideoAttribute(relation.attributes) &&
        isOfficialYouTubeResource(relation.url!.resource!)
    ),
    streaming.filter((relation) => hasVideoAttribute(relation.attributes)),
    streaming.filter((relation) =>
      isOfficialYouTubeResource(relation.url!.resource!)
    ),
    streaming,
  ]

  for (const pool of pools) {
    for (const relation of pool) {
      const videoId = parseYouTubeVideoId(relation.url!.resource!)
      if (videoId) return videoId
    }
  }

  return null
}

export function findMusicVideoRecordingId(
  relations?: MusicBrainzUrlRelation[]
): string | null {
  for (const relation of relations ?? []) {
    if (relation.type?.trim().toLowerCase() !== "music video") continue
    const recordingId = relation.recording?.id?.trim()
    if (recordingId) return recordingId
  }
  return null
}

async function fetchRecordingYouTubeFromApi(recordingId: string) {
  const recording = await musicBrainzFetch<MusicBrainzRecording>({
    path: `/recording/${recordingId}`,
    searchParams: { inc: "url-rels+recording-rels" },
  })

  const direct = extractYouTubeFromRelations(recording.relations)
  if (direct) return direct

  const linkedRecordingId = findMusicVideoRecordingId(recording.relations)
  if (!linkedRecordingId || linkedRecordingId === recordingId) return null

  const linkedRecording = await musicBrainzFetch<MusicBrainzRecording>({
    path: `/recording/${linkedRecordingId}`,
    searchParams: { inc: "url-rels" },
  })

  return extractYouTubeFromRelations(linkedRecording.relations)
}

export async function resolveRecordingYouTubeVideo(
  recordingId: string,
  inlineRelations?: MusicBrainzUrlRelation[]
): Promise<string | null> {
  const inline = extractYouTubeFromRelations(inlineRelations)
  if (inline) return inline

  const linkedRecordingId = findMusicVideoRecordingId(inlineRelations)
  if (linkedRecordingId) {
    try {
      const linkedRecording = await musicBrainzFetch<MusicBrainzRecording>({
        path: `/recording/${linkedRecordingId}`,
        searchParams: { inc: "url-rels" },
      })
      const fromLinked = extractYouTubeFromRelations(linkedRecording.relations)
      if (fromLinked) return fromLinked
    } catch {
      // Fall through to full recording lookup.
    }
  }

  try {
    return await fetchRecordingYouTubeFromApi(recordingId)
  } catch {
    return null
  }
}
