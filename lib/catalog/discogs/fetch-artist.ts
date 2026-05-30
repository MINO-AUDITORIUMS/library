import { discogsFetch } from "@/lib/catalog/discogs/client"

export type DiscogsArtistProfile = {
  discogsArtistId: number
  name: string
  bio: string
  imageUrl: string | null
  country: string
}

type RawDiscogsArtist = {
  id?: number
  name?: string
  profile?: string
  images?: { type?: string; uri?: string; resource_url?: string }[]
  country?: string
  realname?: string
}

function stripDiscogsMarkup(value: string) {
  return value
    .replace(/\[url=[^\]]+\]([^\[]+)\[\/url\]/gi, "$1")
    .replace(/\[([a-z]+=[^\]]+)\]/gi, "")
    .replace(/\[\/?[a-z]+\]/gi, "")
    .replace(/\s+\n/g, "\n")
    .trim()
}

function artistImageUrl(artist: RawDiscogsArtist) {
  const primary =
    artist.images?.find((image) => image.type === "primary") ??
    artist.images?.[0]
  return primary?.uri ?? primary?.resource_url ?? null
}

export async function fetchDiscogsArtistProfile(artistId: number) {
  const data = await discogsFetch<RawDiscogsArtist>({
    path: `/artists/${artistId}`,
  })

  const name = data.name?.trim() ?? ""
  if (!name) return null

  const bio = stripDiscogsMarkup(data.profile?.trim() ?? "")

  return {
    discogsArtistId: artistId,
    name,
    bio,
    imageUrl: artistImageUrl(data),
    country: data.country?.trim() ?? "",
  } satisfies DiscogsArtistProfile
}

export function primaryDiscogsArtistFromRelease(data: unknown) {
  const release = data as {
    artists?: { id?: number; name?: string; role?: string }[]
  }

  const main =
    release.artists?.find(
      (artist) => !artist.role || artist.role.toLowerCase() === "main"
    ) ?? release.artists?.[0]

  if (!main?.id || main.id <= 0) return null

  return {
    discogsArtistId: main.id,
    name: main.name?.trim() ?? "",
  }
}
