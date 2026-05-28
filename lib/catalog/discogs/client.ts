import { getDiscogsConfig } from "@/lib/catalog/discogs/config"

const DISCOGS_API_BASE = "https://api.discogs.com"

export class DiscogsApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "DiscogsApiError"
    this.status = status
  }
}

type DiscogsFetchOptions = {
  path: string
  searchParams?: Record<string, string | number | undefined>
}

export async function discogsFetch<T>({
  path,
  searchParams,
}: DiscogsFetchOptions): Promise<T> {
  const config = getDiscogsConfig()

  if (!config.isConfigured || !config.authMode) {
    throw new DiscogsApiError(
      "Discogs non configuré : ajoute DISCOGS_TOKEN ou DISCOGS_CONSUMER_KEY + DISCOGS_CONSUMER_SECRET dans .env.local",
      503
    )
  }

  const authorization =
    config.authMode === "token"
      ? `Discogs token=${config.token}`
      : `Discogs key=${config.consumerKey}, secret=${config.consumerSecret}`

  const url = new URL(path, DISCOGS_API_BASE)
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value === undefined || value === "") continue
      url.searchParams.set(key, String(value))
    }
  }

  const response = await fetch(url, {
    headers: {
      Authorization: authorization,
      "User-Agent": config.userAgent,
      Accept: "application/json",
    },
    next: { revalidate: 300 },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new DiscogsApiError(
      body || `Discogs API error (${response.status})`,
      response.status
    )
  }

  return response.json() as Promise<T>
}
