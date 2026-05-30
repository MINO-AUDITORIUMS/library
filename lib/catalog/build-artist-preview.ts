import type { SupabaseClient } from "@supabase/supabase-js"

import type { CatalogReleaseImport } from "@/lib/catalog/discogs/types"
import { fetchDiscogsArtistProfile } from "@/lib/catalog/discogs/fetch-artist"
import { fetchMusicBrainzArtistProfile } from "@/lib/catalog/musicbrainz/fetch-artist"
import {
  findArtistByExternalIds,
  countAlbumsByArtistId,
} from "@/lib/catalog/db/artists"

export type ArtistImportPreview = {
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
  const discogsArtistId =
    release.discogsArtistId && release.discogsArtistId > 0
      ? release.discogsArtistId
      : null
  const musicbrainzArtistId = release.musicbrainzArtistId?.trim() || null

  if (!discogsArtistId && !musicbrainzArtistId) {
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

  if (discogsArtistId) {
    try {
      const profile = await fetchDiscogsArtistProfile(discogsArtistId)
      if (profile) {
        name = profile.name || name
        bio = trimBio(profile.bio)
        imageUrl = profile.imageUrl
        country = profile.country
      }
    } catch {
      // Profile fetch is optional for preview.
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
      // Profile fetch is optional for preview.
    }
  }

  const libraryArtistId = existing?.id ?? null
  const libraryAlbumCount = libraryArtistId
    ? await countAlbumsByArtistId(supabase, libraryArtistId)
    : 0

  return {
    discogsArtistId,
    musicbrainzArtistId,
    name: name || release.artist.trim(),
    bio,
    imageUrl,
    country,
    libraryArtistId,
    libraryAlbumCount,
  }
}
