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

function parseSpotifyErrorBody(body: string) {
  try {
    const parsed = JSON.parse(body) as {
      error?: { message?: string; status?: number } | string
      error_description?: string
    }

    if (typeof parsed.error === "object" && parsed.error?.message) {
      return parsed.error.message
    }

    if (typeof parsed.error === "string" && parsed.error.trim()) {
      return parsed.error
    }

    if (parsed.error_description?.trim()) {
      return parsed.error_description
    }
  } catch {
  }

  return body.trim()
}

function formatSpotifyApiError(body: string, status: number) {
  if (status === 429) {
    return "Spotify limite temporairement les requêtes. Réessayez dans quelques secondes."
  }

  if (status === 502 || status === 503) {
    return "Spotify est temporairement indisponible. Réessayez dans quelques instants."
  }

  if (status === 401) {
    return "Identifiants Spotify invalides ou accès refusé."
  }

  const detail = parseSpotifyErrorBody(body)
  if (detail && !detail.startsWith("{")) {
    return detail
  }

  return `Erreur Spotify (${status}).`
}

function isRetryableSpotifyStatus(status: number) {
  return status === 429 || status === 502 || status === 503
}

function spotifyClientStatus(status: number) {
  if (status === 502 || status === 503) return 503
  return status
}

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
      formatSpotifyApiError(body, response.status),
      spotifyClientStatus(response.status)
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

async function spotifyAuthorizedFetch(url: string, attempt: number) {
  const token = await getAccessToken()
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const body = await response.text()
    const status = response.status

    if (attempt === 0 && isRetryableSpotifyStatus(status)) {
      await new Promise((resolve) => setTimeout(resolve, 400))
      return spotifyAuthorizedFetch(url, attempt + 1)
    }

    throw new SpotifyApiError(
      formatSpotifyApiError(body, status),
      spotifyClientStatus(status)
    )
  }

  return response
}

export async function spotifyFetch<T>({
  path,
  searchParams,
}: SpotifyFetchOptions): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  const url = new URL(`${SPOTIFY_API_BASE}${normalizedPath}`)

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value === undefined || value === "") continue
      url.searchParams.set(key, String(value))
    }
  }

  const response = await spotifyAuthorizedFetch(url.toString(), 0)
  return response.json() as Promise<T>
}

export async function spotifyFetchUrl<T>(url: string): Promise<T> {
  const response = await spotifyAuthorizedFetch(url, 0)
  return response.json() as Promise<T>
}
