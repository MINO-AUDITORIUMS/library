import type { DiscogsReleaseVideo } from "@/lib/catalog/discogs/fetch-release"
import type { ImportedTrack } from "@/lib/catalog/track-credits"

const MIN_MATCH_SCORE = 72

const DISQUALIFY_PATTERN =
  /\bfull\s*(lp|album)\b|\bcomplete\s*album\b|\bplaylist\b|\bcompilation\b/i

const OFFICIAL_VIDEO_PATTERN = /\bofficial\b.*\b(music\s*)?video\b/i

function normalizeComparableTitle(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[''`]/g, "")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function extractSongTitleFromVideoTitle(videoTitle: string) {
  let cleaned = videoTitle.trim()

  cleaned = cleaned.replace(OFFICIAL_VIDEO_PATTERN, "")
  cleaned = cleaned.replace(/\([^)]*\)/g, " ")
  cleaned = cleaned.replace(/\[[^\]]*\]/g, " ")

  const dashParts = cleaned.split(/\s+[-–—]\s+/)
  if (dashParts.length >= 2) {
    const tail = dashParts[dashParts.length - 1]?.trim()
    if (tail) return normalizeComparableTitle(tail)
  }

  return normalizeComparableTitle(cleaned)
}

function scoreVideoForTrack(trackTitle: string, video: DiscogsReleaseVideo) {
  const rawTitle = video.title.toLowerCase()

  if (DISQUALIFY_PATTERN.test(rawTitle)) return 0
  if (video.duration === 0 && DISQUALIFY_PATTERN.test(video.title)) return 0
  if (/\b(audio only|lyric video|lyrics video|live at|live from)\b/i.test(rawTitle)) {
    return 0
  }

  const trackNorm = normalizeComparableTitle(trackTitle)
  const videoNorm = extractSongTitleFromVideoTitle(video.title)

  if (!trackNorm || !videoNorm) return 0

  let score = 0

  if (videoNorm === trackNorm) {
    score = 100
  } else if (videoNorm.includes(trackNorm) && trackNorm.length >= 4) {
    score = 88
  } else if (trackNorm.includes(videoNorm) && videoNorm.length >= 4) {
    score = 82
  } else {
    const trackWords = trackNorm.split(" ").filter((word) => word.length > 2)
    const videoWords = new Set(videoNorm.split(" "))
    const overlap = trackWords.filter((word) => videoWords.has(word)).length
    if (overlap >= 2 && overlap / trackWords.length >= 0.75) {
      score = 74
    }
  }

  if (score === 0) return 0

  if (OFFICIAL_VIDEO_PATTERN.test(video.title)) score += 6
  if (/\bvevo\b/i.test(video.title)) score += 4

  return score
}

export function matchDiscogsVideosToTracks(
  tracks: ImportedTrack[],
  videos: DiscogsReleaseVideo[]
): ImportedTrack[] {
  if (videos.length === 0) return tracks

  const usedVideoIds = new Set<string>()
  const assignments = new Map<number, DiscogsReleaseVideo>()

  const candidates: {
    position: number
    video: DiscogsReleaseVideo
    score: number
  }[] = []

  for (const track of tracks) {
    for (const video of videos) {
      const score = scoreVideoForTrack(track.title, video)
      if (score < MIN_MATCH_SCORE) continue
      candidates.push({ position: track.position, video, score })
    }
  }

  candidates.sort((a, b) => b.score - a.score)

  for (const candidate of candidates) {
    if (assignments.has(candidate.position)) continue
    if (usedVideoIds.has(candidate.video.youtubeVideoId)) continue

    assignments.set(candidate.position, candidate.video)
    usedVideoIds.add(candidate.video.youtubeVideoId)
  }

  return tracks.map((track) => {
    const video = assignments.get(track.position)
    if (!video) return track

    return {
      ...track,
      youtube_video_id: video.youtubeVideoId,
      video_source: "discogs" as const,
      video_confirmed: true,
    }
  })
}
