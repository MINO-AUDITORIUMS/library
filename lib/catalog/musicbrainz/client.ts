import { getMusicBrainzConfig } from "@/lib/catalog/musicbrainz/config"

const MUSICBRAINZ_API_BASE = "https://musicbrainz.org/ws/2"

let lastRequestAt = 0

export class MusicBrainzApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "MusicBrainzApiError"
    this.status = status
  }
}

type MusicBrainzFetchOptions = {
  path: string
  searchParams?: Record<string, string | number | undefined>
}

async function throttleMusicBrainzRequest() {
  const elapsed = Date.now() - lastRequestAt
  if (elapsed < 1100) {
    await new Promise((resolve) => setTimeout(resolve, 1100 - elapsed))
  }
  lastRequestAt = Date.now()
}

export async function musicBrainzFetch<T>({
  path,
  searchParams,
}: MusicBrainzFetchOptions): Promise<T> {
  const config = getMusicBrainzConfig()
  await throttleMusicBrainzRequest()

  const url = new URL(path, `${MUSICBRAINZ_API_BASE}/`)
  url.searchParams.set("fmt", "json")
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value === undefined || value === "") continue
      url.searchParams.set(key, String(value))
    }
  }

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": config.userAgent,
    },
    next: { revalidate: 3600 },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new MusicBrainzApiError(
      body || `MusicBrainz API error (${response.status})`,
      response.status
    )
  }

  return response.json() as Promise<T>
}
