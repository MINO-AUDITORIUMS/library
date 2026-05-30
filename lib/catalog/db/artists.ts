import type { SupabaseClient } from "@supabase/supabase-js"

import {
  buildArtistExternalIds,
  discogsArtistIdFromExternalIds,
  musicbrainzArtistIdFromExternalIds,
} from "@/lib/catalog/artist-external-ids"
import { fetchDiscogsArtistProfile } from "@/lib/catalog/discogs/fetch-artist"
import { fetchMusicBrainzArtistProfile } from "@/lib/catalog/musicbrainz/fetch-artist"
import { coverHueFromId } from "@/lib/catalog/cover-hue"
import { slugify } from "@/lib/catalog/slug"
import type { AlbumSummary, ArtistDetail, ArtistSummary } from "@/lib/catalog/types"

export type ArtistRow = {
  id: string
  name: string
  slug: string
  bio: string | null
  image_url: string | null
  country: string | null
  external_ids: Record<string, unknown>
  created_at: string
}

const artistSelect = `
  id,
  name,
  slug,
  bio,
  image_url,
  country,
  external_ids,
  created_at
`

export type ResolveArtistInput = {
  name: string
  discogsArtistId: number | null
  musicbrainzArtistId: string | null
}

function buildArtistSlug(input: ResolveArtistInput) {
  const base = slugify(input.name.trim()) || "artist"
  if (input.discogsArtistId && input.discogsArtistId > 0) {
    return `${base}-d${input.discogsArtistId}`
  }
  if (input.musicbrainzArtistId?.trim()) {
    const compact = input.musicbrainzArtistId.replace(/-/g, "").slice(0, 12)
    return `${base}-m${compact}`
  }
  return null
}

function trimBio(value: string, maxLength = 2000) {
  const trimmed = value.trim()
  if (trimmed.length <= maxLength) return trimmed
  return `${trimmed.slice(0, maxLength - 1)}…`
}

export function mapArtistSummary(
  row: Pick<
    ArtistRow,
    "id" | "name" | "slug" | "image_url" | "country" | "created_at"
  >,
  albumCount: number
): ArtistSummary {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    imageUrl: row.image_url,
    country: row.country?.trim() ?? "",
    coverHue: coverHueFromId(row.id),
    albumCount,
  }
}

function readAlbumCount(value: { count: number }[] | null | undefined) {
  return value?.[0]?.count ?? 0
}

export async function searchArtistSummaries(
  supabase: SupabaseClient,
  query: string,
  limit = 5
) {
  const trimmed = query.trim()
  if (trimmed.length < 2) return []

  const pattern = `%${trimmed.replace(/[%_\\]/g, "\\$&")}%`
  const { data, error } = await supabase
    .from("artists")
    .select(`
      id,
      name,
      slug,
      image_url,
      country,
      created_at,
      albums(count)
    `)
    .ilike("name", pattern)
    .order("name", { ascending: true })
    .limit(limit)

  if (error) throw error

  return (data ?? []).map((row) =>
    mapArtistSummary(
      row as Pick<
        ArtistRow,
        "id" | "name" | "slug" | "image_url" | "country" | "created_at"
      >,
      readAlbumCount((row as { albums?: { count: number }[] }).albums)
    )
  )
}

export async function listArtistSummaries(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("artists")
    .select(`
      id,
      name,
      slug,
      image_url,
      country,
      created_at,
      albums(count)
    `)
    .order("name", { ascending: true })

  if (error) throw error

  return (data ?? []).map((row) =>
    mapArtistSummary(
      row as Pick<
        ArtistRow,
        "id" | "name" | "slug" | "image_url" | "country" | "created_at"
      >,
      readAlbumCount((row as { albums?: { count: number }[] }).albums)
    )
  )
}

export function mapArtistDetail(
  row: ArtistRow,
  albums: AlbumSummary[]
): ArtistDetail {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    bio: row.bio?.trim() ?? "",
    imageUrl: row.image_url,
    country: row.country?.trim() ?? "",
    coverHue: coverHueFromId(row.id),
    discogsArtistId: discogsArtistIdFromExternalIds(row.external_ids),
    musicbrainzArtistId: musicbrainzArtistIdFromExternalIds(row.external_ids),
    albums,
    albumCount: albums.length,
    addedAt: row.created_at.slice(0, 10),
  }
}

export async function findArtistByExternalIds(
  supabase: SupabaseClient,
  input: {
    discogsArtistId: number | null
    musicbrainzArtistId: string | null
  }
) {
  if (input.discogsArtistId && input.discogsArtistId > 0) {
    const { data, error } = await supabase
      .from("artists")
      .select("id, name, slug, external_ids")
      .eq("external_ids->>discogs", String(input.discogsArtistId))
      .maybeSingle()

    if (error) throw error
    if (data) {
      return data as Pick<ArtistRow, "id" | "name" | "slug" | "external_ids">
    }
  }

  if (input.musicbrainzArtistId?.trim()) {
    const { data, error } = await supabase
      .from("artists")
      .select("id, name, slug, external_ids")
      .eq("external_ids->>musicbrainz", input.musicbrainzArtistId.trim())
      .maybeSingle()

    if (error) throw error
    if (data) {
      return data as Pick<ArtistRow, "id" | "name" | "slug" | "external_ids">
    }
  }

  return null
}

export async function countAlbumsByArtistId(
  supabase: SupabaseClient,
  artistId: string
) {
  const { count, error } = await supabase
    .from("albums")
    .select("id", { count: "exact", head: true })
    .eq("artist_id", artistId)

  if (error) throw error
  return count ?? 0
}

async function fetchArtistProfile(input: ResolveArtistInput) {
  let name = input.name.trim()
  let bio = ""
  let imageUrl: string | null = null
  let country = ""

  if (input.discogsArtistId && input.discogsArtistId > 0) {
    try {
      const profile = await fetchDiscogsArtistProfile(input.discogsArtistId)
      if (profile) {
        name = profile.name || name
        bio = trimBio(profile.bio)
        imageUrl = profile.imageUrl
        country = profile.country
      }
    } catch {
      // Optional enrichment.
    }
  }

  if (!bio && input.musicbrainzArtistId?.trim()) {
    try {
      const profile = await fetchMusicBrainzArtistProfile(
        input.musicbrainzArtistId.trim()
      )
      if (profile) {
        name = profile.name || name
        bio = trimBio(profile.bio)
        if (!country) country = profile.country
      }
    } catch {
      // Optional enrichment.
    }
  }

  return { name: name || input.name.trim(), bio, imageUrl, country }
}

async function mergeArtistExternalIds(
  supabase: SupabaseClient,
  artistId: string,
  existing: Record<string, unknown>,
  input: ResolveArtistInput
) {
  const merged = {
    ...existing,
    ...buildArtistExternalIds(input),
  }

  const { error } = await supabase
    .from("artists")
    .update({ external_ids: merged })
    .eq("id", artistId)

  if (error) throw error
}

export async function resolveOrCreateArtist(
  supabase: SupabaseClient,
  input: ResolveArtistInput
): Promise<string | null> {
  const discogsArtistId =
    input.discogsArtistId && input.discogsArtistId > 0
      ? input.discogsArtistId
      : null
  const musicbrainzArtistId = input.musicbrainzArtistId?.trim() || null

  if (!discogsArtistId && !musicbrainzArtistId) {
    return null
  }

  const slug = buildArtistSlug({
    name: input.name,
    discogsArtistId,
    musicbrainzArtistId,
  })

  if (!slug) return null

  const existing = await findArtistByExternalIds(supabase, {
    discogsArtistId,
    musicbrainzArtistId,
  })

  const profile = await fetchArtistProfile({
    name: input.name,
    discogsArtistId,
    musicbrainzArtistId,
  })

  if (existing) {
    const { error } = await supabase
      .from("artists")
      .update({
        name: profile.name,
        bio: profile.bio || null,
        image_url: profile.imageUrl,
        country: profile.country || null,
      })
      .eq("id", existing.id)

    if (error) throw error

    await mergeArtistExternalIds(supabase, existing.id, existing.external_ids, {
      name: profile.name,
      discogsArtistId,
      musicbrainzArtistId,
    })

    return existing.id
  }

  const { data, error } = await supabase
    .from("artists")
    .insert({
      name: profile.name,
      slug,
      bio: profile.bio || null,
      image_url: profile.imageUrl,
      country: profile.country || null,
      external_ids: buildArtistExternalIds({
        discogsArtistId,
        musicbrainzArtistId,
      }),
    })
    .select("id")
    .single()

  if (error) throw error
  return data.id as string
}

export async function getArtistTitleById(
  supabase: SupabaseClient,
  artistId: string
) {
  const { data, error } = await supabase
    .from("artists")
    .select("name")
    .eq("id", artistId)
    .maybeSingle()

  if (error || !data) return null
  return data.name as string
}
