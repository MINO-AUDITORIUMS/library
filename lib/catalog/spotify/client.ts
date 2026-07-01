import { getSpotifyConfig } from "@/lib/catalog/spotify/config"

const SPOTIFY_API_BASE = "https://api.spotify.com/v1"
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"

export class SpotifyApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "SpotifyApiError"
    this.status = status
  }
}

type TokenCache = {
  token: string
  expiresAt: number
}

let tokenCache: TokenCache | null = null

async function getAccessToken() {
  const config = getSpotifyConfig()
  if (!config.isConfigured) {
    throw new SpotifyApiError(
      "Spotify non configuré : ajoute SPOTIFY_CLIENT_ID et SPOTIFY_CLIENT_SECRET dans .env.local",
      503
    )
  }

  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.token
  }

  const credentials = Buffer.from(
    `${config.clientId}:${config.clientSecret}`
  ).toString("base64")

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  })

  if (!response.ok) {
    const body = await response.text()
    throw new SpotifyApiError(
      body || `Spotify token error (${response.status})`,
      response.status
    )
  }

  const data = (await response.json()) as {
    access_token?: string
    expires_in?: number
  }

  if (!data.access_token) {
    throw new SpotifyApiError("Réponse token Spotify invalide.", 502)
  }

  const expiresIn = data.expires_in ?? 3600
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + expiresIn * 1000,
  }

  return data.access_token
}

type SpotifyFetchOptions = {
  path: string
  searchParams?: Record<string, string | number | undefined>
}

export async function spotifyFetch<T>({
  path,
  searchParams,
}: SpotifyFetchOptions): Promise<T> {
  const token = await getAccessToken()
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  const url = new URL(`${SPOTIFY_API_BASE}${normalizedPath}`)

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value === undefined || value === "") continue
      url.searchParams.set(key, String(value))
    }
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    next: { revalidate: 300 },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new SpotifyApiError(
      body || `Spotify API error (${response.status})`,
      response.status
    )
  }

  return response.json() as Promise<T>
}

export async function spotifyFetchUrl<T>(url: string): Promise<T> {
  const token = await getAccessToken()
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    next: { revalidate: 300 },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new SpotifyApiError(
      body || `Spotify API error (${response.status})`,
      response.status
    )
  }

  return response.json() as Promise<T>
}
