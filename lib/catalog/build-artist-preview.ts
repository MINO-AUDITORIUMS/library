import type { SupabaseClient } from "@supabase/supabase-js"

import { normalizeArtistDisplayName } from "@/lib/catalog/normalize-artist-name"

import type { CatalogReleaseImport } from "@/lib/catalog/discogs/types"
import { fetchDiscogsArtistProfile } from "@/lib/catalog/discogs/fetch-artist"
import { fetchMusicBrainzArtistProfile } from "@/lib/catalog/musicbrainz/fetch-artist"
import { fetchSpotifyArtistProfile } from "@/lib/catalog/spotify/fetch-artist"
import {
  findArtistByExternalIds,
  countAlbumsByArtistId,
} from "@/lib/catalog/db/artists"

export type ArtistImportPreview = {
  spotifyArtistId: string | null
  discogsArtistId: number | null
  musicbrainzArtistId: string | null
  name: string
  bio: string
  imageUrl: string | null
  country: string
  libraryArtistId: string | null
  libraryAlbumCount: number
}

function trimBio(value: string, maxLength = 480) {
  const trimmed = value.trim()
  if (trimmed.length <= maxLength) return trimmed
  return `${trimmed.slice(0, maxLength - 1)}…`
}

export async function buildArtistImportPreview(
  supabase: SupabaseClient,
  release: CatalogReleaseImport
): Promise<ArtistImportPreview | null> {
  const spotifyArtistId = release.spotifyArtistId?.trim() || null
  const discogsArtistId =
    release.discogsArtistId && release.discogsArtistId > 0
      ? release.discogsArtistId
      : null
  const musicbrainzArtistId = release.musicbrainzArtistId?.trim() || null

  if (!spotifyArtistId && !discogsArtistId && !musicbrainzArtistId) {
    return null
  }

  const existing = await findArtistByExternalIds(supabase, {
    discogsArtistId,
    musicbrainzArtistId,
  })

  let name = release.artist.trim()
  let bio = ""
  let imageUrl: string | null = null
  let country = ""

  if (spotifyArtistId) {
    try {
      const profile = await fetchSpotifyArtistProfile(spotifyArtistId)
      if (profile) {
        name = profile.name || name
        imageUrl = profile.imageUrl
        if (profile.genres.length > 0) {
          bio = trimBio(profile.genres.join(", "))
        }
      }
    } catch {
    }
  }

  if (discogsArtistId) {
    try {
      const profile = await fetchDiscogsArtistProfile(discogsArtistId)
      if (profile) {
        name = profile.name || name
        if (!bio) bio = trimBio(profile.bio)
        if (!imageUrl) imageUrl = profile.imageUrl
        country = profile.country
      }
    } catch {
    }
  }

  if (!bio && musicbrainzArtistId) {
    try {
      const profile = await fetchMusicBrainzArtistProfile(musicbrainzArtistId)
      if (profile) {
        name = profile.name || name
        bio = trimBio(profile.bio)
        if (!country) country = profile.country
      }
    } catch {
    }
  }

  const libraryArtistId = existing?.id ?? null
  const libraryAlbumCount = libraryArtistId
    ? await countAlbumsByArtistId(supabase, libraryArtistId)
    : 0

  return {
    spotifyArtistId,
    discogsArtistId,
    musicbrainzArtistId,
    name: normalizeArtistDisplayName(name || release.artist.trim()),
    bio,
    imageUrl,
    country,
    libraryArtistId,
    libraryAlbumCount,
  }
}
