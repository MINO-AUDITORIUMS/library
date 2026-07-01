export function parseYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.toLowerCase()

    if (host === "youtu.be" || host.endsWith(".youtu.be")) {
      const id = parsed.pathname.slice(1).split("/")[0]?.trim()
      return id && id.length > 0 ? id : null
    }

    if (!host.includes("youtube.com")) return null

    if (parsed.pathname === "/watch") {
      return parsed.searchParams.get("v")
    }

    const embedMatch = parsed.pathname.match(/^\/embed\/([^/?]+)/)
    if (embedMatch?.[1]) return embedMatch[1]

    const shortsMatch = parsed.pathname.match(/^\/shorts\/([^/?]+)/)
    if (shortsMatch?.[1]) return shortsMatch[1]

    return null
  } catch {
    return null
  }
}

export function youTubeWatchUrl(videoId: string) {
  return `https://www.youtube.com/watch?v=${videoId}`
}

export function youTubeEmbedUrl(videoId: string) {
  return `https://www.youtube.com/embed/${videoId}`
}

const RAW_YOUTUBE_VIDEO_ID = /^[\w-]{11}$/

export function parseYouTubeVideoInput(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  const fromUrl = parseYouTubeVideoId(trimmed)
  if (fromUrl) return fromUrl

  return RAW_YOUTUBE_VIDEO_ID.test(trimmed) ? trimmed : null
}

export function formatYouTubeVideoInput(videoId: string | null) {
  return videoId ? youTubeWatchUrl(videoId) : ""
}
