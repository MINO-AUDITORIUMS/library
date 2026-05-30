import { musicBrainzFetch } from "@/lib/catalog/musicbrainz/client"

export type MusicBrainzArtistProfile = {
  musicbrainzArtistId: string
  name: string
  bio: string
  country: string
}

type MusicBrainzArtist = {
  id?: string
  name?: string
  country?: string
  annotation?: string
  disambiguation?: string
}

export function primaryMusicBrainzArtistFromRelease(data: unknown) {
  const release = data as {
    "artist-credit"?: {
      name?: string
      artist?: { id?: string; name?: string }
    }[]
  }

  const credit = release["artist-credit"]?.[0]
  const artist = credit?.artist
  if (!artist?.id?.trim()) return null

  return {
    musicbrainzArtistId: artist.id.trim(),
    name: (credit?.name ?? artist.name ?? "").trim(),
  }
}

export async function fetchMusicBrainzArtistProfile(artistId: string) {
  const data = await musicBrainzFetch<MusicBrainzArtist>({
    path: `/artist/${artistId}`,
    searchParams: { inc: "aliases+annotation" },
  })

  const name = data.name?.trim() ?? ""
  if (!name) return null

  const bioParts = [data.annotation?.trim(), data.disambiguation?.trim()].filter(
    (part) => part && part.length > 0
  )

  return {
    musicbrainzArtistId: artistId,
    name,
    bio: bioParts.join("\n\n"),
    country: data.country?.trim() ?? "",
  } satisfies MusicBrainzArtistProfile
}
