import { musicBrainzFetch } from "@/lib/catalog/musicbrainz/client"
import type {
  MusicBrainzRecording,
  MusicBrainzRelease,
  MusicBrainzWork,
} from "@/lib/catalog/musicbrainz/types"
import {
  type ImportedTrack,
  isMusicBrainzProducerRelation,
  isMusicBrainzWriterRelation,
  uniqueCreditNames,
} from "@/lib/catalog/track-credits"

function extractRecordingCredits(recording?: MusicBrainzRecording) {
  const writers: string[] = []
  const producers: string[] = []
  const pendingWorkIds: string[] = []

  for (const relation of recording?.relations ?? []) {
    const type = relation.type ?? ""
    const artistName = relation.artist?.name?.trim()

    if (artistName && isMusicBrainzProducerRelation(type)) {
      producers.push(artistName)
    }

    const work = relation.work
    if (!work?.id) continue

    let foundWriter = false
    for (const workRelation of work.relations ?? []) {
      const workType = workRelation.type ?? ""
      const workArtist = workRelation.artist?.name?.trim()
      if (workArtist && isMusicBrainzWriterRelation(workType)) {
        writers.push(workArtist)
        foundWriter = true
      }
    }

    if (!foundWriter) {
      pendingWorkIds.push(work.id)
    }
  }

  return {
    writers: uniqueCreditNames(writers),
    producers: uniqueCreditNames(producers),
    pendingWorkIds,
  }
}

async function fetchWorkWriters(workIds: string[]) {
  const writersByWorkId = new Map<string, string[]>()

  for (const workId of workIds) {
    try {
      const work = await musicBrainzFetch<MusicBrainzWork>({
        path: `/work/${workId}`,
        searchParams: { inc: "artist-rels" },
      })

      const writers = uniqueCreditNames(
        (work.relations ?? [])
          .filter(
            (relation) =>
              relation.artist?.name &&
              isMusicBrainzWriterRelation(relation.type ?? "")
          )
          .map((relation) => relation.artist?.name ?? "")
      )

      if (writers.length > 0) {
        writersByWorkId.set(workId, writers)
      }
    } catch {
      continue
    }
  }

  return writersByWorkId
}

export async function fetchMusicBrainzTracks(releaseId: string) {
  const data = await musicBrainzFetch<MusicBrainzRelease>({
    path: `/release/${releaseId}`,
    searchParams: {
      inc: "recordings+media+recording-level-rels+work-level-rels",
    },
  })

  const draft: {
    position: number
    title: string
    duration_seconds: number | null
    writers: string[]
    producers: string[]
    workIds: string[]
  }[] = []
  const pendingWorkIds = new Set<string>()
  let position = 0

  for (const medium of data.media ?? []) {
    for (const track of medium.tracks ?? []) {
      const title = track.title?.trim() || track.recording?.title?.trim()
      if (!title) continue

      position += 1
      const lengthMs = track.length ?? track.recording?.length
      const credits = extractRecordingCredits(track.recording)
      const workIds = (track.recording?.relations ?? [])
        .map((relation) => relation.work?.id)
        .filter((workId): workId is string => Boolean(workId))

      for (const workId of credits.pendingWorkIds) {
        pendingWorkIds.add(workId)
      }

      draft.push({
        position: track.position || position,
        title,
        duration_seconds:
          typeof lengthMs === "number" && lengthMs > 0
            ? Math.round(lengthMs / 1000)
            : null,
        writers: credits.writers,
        producers: credits.producers,
        workIds,
      })
    }
  }

  const writersByWorkId =
    pendingWorkIds.size > 0
      ? await fetchWorkWriters([...pendingWorkIds])
      : new Map<string, string[]>()

  return draft.map((track) => {
    const extraWriters = track.workIds.flatMap(
      (workId) => writersByWorkId.get(workId) ?? []
    )

    return {
      position: track.position,
      title: track.title,
      duration_seconds: track.duration_seconds,
      writers: uniqueCreditNames([...track.writers, ...extraWriters]),
      producers: track.producers,
    }
  })
}

export type { ImportedTrack }
