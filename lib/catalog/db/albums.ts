import type { SupabaseClient, User } from "@supabase/supabase-js"

import { ensureProfile } from "@/lib/auth/ensure-profile"

import { countryDisplayName, resolveCountryCode } from "@/lib/catalog/country-code"
import { coverHueFromId } from "@/lib/catalog/cover-hue"
import {
  discogsIdFromExternalIds,
  hasTrackImportSources,
  musicbrainzIdFromExternalIds,
} from "@/lib/catalog/external-ids"
import {
  getAlbumCoverPublicUrl,
  removeAlbumCover,
  uploadAlbumCoverFromUrl,
} from "@/lib/catalog/storage/album-cover"
import type { CreateAlbumInput } from "@/lib/catalog/create-album-input"
import {
  parseOptionalInt,
  parseProducers,
  parseReleaseDate,
} from "@/lib/catalog/create-album-input"
import { persistAlbumTracks } from "@/lib/catalog/persist-album-tracks"
import { resolveImportTracks } from "@/lib/catalog/resolve-import-tracks"
import { DuplicateAlbumError } from "@/lib/catalog/duplicate-album-error"
import { findExistingAlbumId } from "@/lib/catalog/db/find-existing-album"
import { minoRatingFromRows } from "@/lib/catalog/db/album-user-ratings"
import { syncAlbumTags } from "@/lib/catalog/db/tags"
import type { UpdateAlbumInput } from "@/lib/catalog/update-album-input"
import { stripCatalogDisambiguation } from "@/lib/catalog/normalize-artist-name"
import { slugify } from "@/lib/catalog/slug"
import { uniqueCreditNames } from "@/lib/catalog/track-credits"
import { resolveOrCreateArtist } from "@/lib/catalog/db/artists"
import type {
  AlbumDetail,
  AlbumSummary,
  AlbumTrack,
} from "@/lib/catalog/types"

type AlbumRow = {
  id: string
  title: string
  artist: string
  artist_id: string | null
  release_year: number | null
  release_date: string | null
  total_duration_seconds: number | null
  track_count: number | null
  label: string | null
  record_company: string | null
  producers: string[]
  origin_country_code: string | null
  certification: string | null
  official_videos_count: number
  rating: number | null
  personal_notes: string | null
  cover_storage_path: string | null
  external_ids: Record<string, unknown>
  created_at: string
  countries: { name: string } | { name: string }[] | null
  album_genres: { genres: { name: string } | { name: string }[] | null }[] | null
  album_subgenres:
    | { subgenres: { name: string } | { name: string }[] | null }[]
    | null
  album_tags: { tags: { name: string } | { name: string }[] | null }[] | null
  album_user_ratings: { rating: number }[] | null
  album_tracks:
    | {
        position: number
        title: string
        duration_seconds: number | null
        writers: string[]
        producers: string[]
        featuring?: string[]
        youtube_video_id: string | null
        video_confirmed: boolean
      }[]
    | null
}

const albumListSelect = `
  id,
  title,
  artist,
  release_year,
  label,
  origin_country_code,
  cover_storage_path,
  countries(name),
  album_genres(genres(name)),
  album_subgenres(subgenres(name)),
  album_tags(tags(name)),
  album_user_ratings(rating)
`

const albumDetailSelect = `
  id,
  title,
  artist,
  artist_id,
  release_year,
  release_date,
  total_duration_seconds,
  track_count,
  label,
  record_company,
  producers,
  origin_country_code,
  certification,
  official_videos_count,
  personal_notes,
  cover_storage_path,
  external_ids,
  created_at,
  countries(name),
  album_genres(genres(name)),
  album_subgenres(subgenres(name)),
  album_tags(tags(name)),
  album_tracks(position, title, duration_seconds, writers, producers, featuring, youtube_video_id, video_confirmed)
`

function readName(value: { name: string } | { name: string }[] | null | undefined) {
  if (!value) return ""
  if (Array.isArray(value)) return value[0]?.name ?? ""
  return value.name
}

function firstGenre(row: AlbumRow) {
  return readName(row.album_genres?.[0]?.genres ?? null)
}

function firstSubgenre(row: AlbumRow) {
  return readName(row.album_subgenres?.[0]?.subgenres ?? null)
}

function mapTags(row: AlbumRow) {
  return (row.album_tags ?? [])
    .map((link) => readName(link.tags ?? null))
    .filter((name) => name.length > 0)
}

function readCountry(row: AlbumRow) {
  return readName(row.countries ?? null)
}

function mapTracks(
  rows: AlbumRow["album_tracks"]
): AlbumTrack[] {
  return (rows ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((track) => ({
      position: track.position,
      title: track.title,
      durationSeconds: track.duration_seconds,
      writers: uniqueCreditNames(track.writers ?? []),
      producers: uniqueCreditNames(track.producers ?? []),
      featuring: uniqueCreditNames(track.featuring ?? []),
      youtubeVideoId:
        track.video_confirmed && track.youtube_video_id
          ? track.youtube_video_id
          : null,
    }))
}

export function mapAlbumSummary(row: AlbumRow): AlbumSummary {
  const genreName = firstGenre(row)
  const subgenreName = firstSubgenre(row)
  const genre = genreName || subgenreName || "—"
  const country =
    readCountry(row) ||
    (row.origin_country_code
      ? countryDisplayName(row.origin_country_code)
      : "")

  return {
    id: row.id,
    title: stripCatalogDisambiguation(row.title),
    artist: stripCatalogDisambiguation(row.artist),
    releaseYear: row.release_year ?? 0,
    label: stripCatalogDisambiguation(row.label ?? "—") || "—",
    minoRating: minoRatingFromRows(row.album_user_ratings),
    tags: mapTags(row),
    genre,
    genreName,
    subgenreName,
    country,
    coverHue: coverHueFromId(row.id),
    coverImageUrl: getAlbumCoverPublicUrl(row.cover_storage_path),
  }
}

export function mapAlbumDetail(row: AlbumRow): AlbumDetail {
  const summary = mapAlbumSummary(row)
  const tracks = mapTracks(row.album_tracks)
  const totalDuration =
    row.total_duration_seconds ??
    tracks.reduce((sum, track) => sum + (track.durationSeconds ?? 0), 0)

  const genreName = firstGenre(row)
  const subgenreName = firstSubgenre(row)

  return {
    ...summary,
    discogsReleaseId: discogsIdFromExternalIds(row.external_ids),
    musicbrainzReleaseId: musicbrainzIdFromExternalIds(row.external_ids),
    artistId: row.artist_id,
    canSyncTracks:
      hasTrackImportSources(row.external_ids) ||
      Boolean(row.title?.trim() && row.artist?.trim()),
    releaseDate: row.release_date,
    subgenre: subgenreName || "—",
    recordCompany: stripCatalogDisambiguation(row.record_company ?? "") || "—",
    producers:
      row.producers.length > 0 ? uniqueCreditNames(row.producers) : ["—"],
    certification: row.certification,
    trackCount: row.track_count ?? tracks.length,
    totalDurationSeconds: totalDuration,
    personalNotes: row.personal_notes?.trim() ?? "",
    tracks,
    officialVideosCount: row.official_videos_count,
    addedAt: row.created_at.slice(0, 10),
  }
}

async function ensureGenre(
  supabase: SupabaseClient,
  name: string
): Promise<string | null> {
  const trimmed = name.trim()
  if (!trimmed) return null

  const { data: existing } = await supabase
    .from("genres")
    .select("id")
    .ilike("name", trimmed)
    .maybeSingle()

  if (existing?.id) return existing.id

  const slug = slugify(trimmed) || "genre"
  const { data, error } = await supabase
    .from("genres")
    .insert({ name: trimmed, slug })
    .select("id")
    .single()

  if (error) return null
  return data.id
}

async function ensureSubgenre(
  supabase: SupabaseClient,
  genreId: string,
  name: string
): Promise<string | null> {
  const trimmed = name.trim()
  if (!trimmed) return null

  const { data: existing } = await supabase
    .from("subgenres")
    .select("id")
    .eq("genre_id", genreId)
    .ilike("name", trimmed)
    .maybeSingle()

  if (existing?.id) return existing.id

  const slug = slugify(trimmed) || "subgenre"
  const { data, error } = await supabase
    .from("subgenres")
    .insert({ genre_id: genreId, name: trimmed, slug })
    .select("id")
    .single()

  if (error) return null
  return data.id
}

async function resolveOriginCountryCode(
  supabase: SupabaseClient,
  country: string
) {
  const code = resolveCountryCode(country)
  if (!code) return null

  const { data: existing, error: existingError } = await supabase
    .from("countries")
    .select("code")
    .eq("code", code)
    .maybeSingle()

  if (existingError) throw existingError
  if (existing?.code) return existing.code

  const name = countryDisplayName(code, country.trim())
  const { data: inserted, error: insertError } = await supabase
    .from("countries")
    .insert({ code, name })
    .select("code")
    .maybeSingle()

  if (insertError) {
    const { data: retry, error: retryError } = await supabase
      .from("countries")
      .select("code")
      .eq("code", code)
      .maybeSingle()

    if (retryError) throw retryError
    return retry?.code ?? null
  }

  return inserted?.code ?? null
}

export async function searchAlbumSummaries(
  supabase: SupabaseClient,
  query: string,
  limit = 8
) {
  const trimmed = query.trim()
  if (trimmed.length < 2) return []

  const escaped = trimmed.replace(/"/g, '""').replace(/[%_\\]/g, "\\$&")
  const pattern = `%${escaped}%`

  const { data, error } = await supabase
    .from("albums")
    .select(albumListSelect)
    .or(
      `title.ilike."${pattern}",artist.ilike."${pattern}",label.ilike."${pattern}",record_company.ilike."${pattern}"`
    )
    .order("title", { ascending: true })
    .limit(limit)

  if (error) throw error
  return (data as unknown as AlbumRow[]).map(mapAlbumSummary)
}

export async function listAlbumSummariesByArtistId(
  supabase: SupabaseClient,
  artistId: string
) {
  const { data, error } = await supabase
    .from("albums")
    .select(albumListSelect)
    .eq("artist_id", artistId)
    .order("release_year", { ascending: false, nullsFirst: false })
    .order("title", { ascending: true })

  if (error) throw error
  return (data as unknown as AlbumRow[]).map(mapAlbumSummary)
}

export async function countAlbums(supabase: SupabaseClient) {
  const { count, error } = await supabase
    .from("albums")
    .select("id", { count: "exact", head: true })

  if (error) throw error
  return count ?? 0
}

export async function listRecentAlbumSummaries(
  supabase: SupabaseClient,
  limit = 6
) {
  const { data, error } = await supabase
    .from("albums")
    .select(albumListSelect)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data as unknown as AlbumRow[]).map(mapAlbumSummary)
}

export async function listAlbumSummaries(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("albums")
    .select(albumListSelect)
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data as unknown as AlbumRow[]).map(mapAlbumSummary)
}

export async function getAlbumDetailById(
  supabase: SupabaseClient,
  id: string
) {
  const { data, error } = await supabase
    .from("albums")
    .select(albumDetailSelect)
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  return mapAlbumDetail(data as unknown as AlbumRow)
}

export async function getAlbumTitleById(
  supabase: SupabaseClient,
  id: string
) {
  const { data, error } = await supabase
    .from("albums")
    .select("title")
    .eq("id", id)
    .maybeSingle()

  if (error || !data) return null
  return data.title as string
}

export async function createAlbum(
  supabase: SupabaseClient,
  user: User,
  input: CreateAlbumInput
) {
  await ensureProfile(supabase, user)

  const releaseYear = parseOptionalInt(input.releaseYear)
  const trackCount = parseOptionalInt(input.trackCount)
  const releaseDate = parseReleaseDate(input.releaseDate)
  const originCountryCode = await resolveOriginCountryCode(
    supabase,
    input.country
  )

  const artistId = await resolveOrCreateArtist(supabase, {
    name: input.artist,
    discogsArtistId: input.discogsArtistId,
    musicbrainzArtistId: input.musicbrainzArtistId,
  })

  const externalIds: Record<string, unknown> = {}
  if (input.spotifyAlbumId) externalIds.spotify = input.spotifyAlbumId
  if (input.discogsReleaseId) externalIds.discogs = input.discogsReleaseId
  if (input.musicbrainzReleaseId) {
    externalIds.musicbrainz = input.musicbrainzReleaseId
  }

  const existingAlbumId = await findExistingAlbumId(supabase, {
    spotifyAlbumId: input.spotifyAlbumId,
    discogsReleaseId: input.discogsReleaseId,
    musicbrainzReleaseId: input.musicbrainzReleaseId,
  })
  if (existingAlbumId) {
    throw new DuplicateAlbumError(existingAlbumId)
  }

  const { data: album, error } = await supabase
    .from("albums")
    .insert({
      title: input.title,
      artist: input.artist,
      artist_id: artistId,
      release_year: releaseYear,
      release_date: releaseDate,
      track_count: trackCount,
      label: input.label || null,
      record_company: input.recordCompany || null,
      producers: parseProducers(input.producers),
      origin_country_code: originCountryCode,
      certification: input.certification.trim() || null,
      personal_notes: input.personalNotes.trim() || null,
      external_ids: externalIds,
      cover_storage_path: null,
      created_by: user.id,
      updated_by: user.id,
    })
    .select("id")
    .single()

  if (error) throw error

  const albumId = album.id as string

  if (input.coverImageUrl) {
    try {
      const coverPath = await uploadAlbumCoverFromUrl(
        supabase,
        albumId,
        input.coverImageUrl
      )
      if (coverPath) {
        await supabase
          .from("albums")
          .update({ cover_storage_path: coverPath })
          .eq("id", albumId)
      }
    } catch {
      // Cover import is optional; album row is already created.
    }
  }

  if (input.genre) {
    const genreId = await ensureGenre(supabase, input.genre)
    if (genreId) {
      await supabase
        .from("album_genres")
        .insert({ album_id: albumId, genre_id: genreId })

      if (input.subgenre) {
        const subgenreId = await ensureSubgenre(
          supabase,
          genreId,
          input.subgenre
        )
        if (subgenreId) {
          await supabase
            .from("album_subgenres")
            .insert({ album_id: albumId, subgenre_id: subgenreId })
        }
      }
    }
  }

  if (input.title.trim() && input.artist.trim()) {
    try {
      const { tracks, sources } = await resolveImportTracks({
        spotifyAlbumId: input.spotifyAlbumId,
        discogsReleaseId: input.discogsReleaseId,
        musicbrainzReleaseId: input.musicbrainzReleaseId,
        albumTitle: input.title,
        albumArtist: input.artist,
      })
      if (tracks.length > 0) {
        await persistAlbumTracks(supabase, albumId, tracks)

        const nextExternalIds = { ...externalIds }
        if (sources.spotifyAlbumId) {
          nextExternalIds.spotify = sources.spotifyAlbumId
        }
        if (sources.discogsReleaseId) {
          nextExternalIds.discogs = sources.discogsReleaseId
        }
        if (sources.musicbrainzReleaseId) {
          nextExternalIds.musicbrainz = sources.musicbrainzReleaseId
        }

        if (JSON.stringify(nextExternalIds) !== JSON.stringify(externalIds)) {
          await supabase
            .from("albums")
            .update({ external_ids: nextExternalIds })
            .eq("id", albumId)
        }
      }
    } catch {
      // Track import is optional; album row is already created.
    }
  }

  await syncAlbumTags(supabase, user, albumId, input.tags)

  return albumId
}

async function syncAlbumGenreLinks(
  supabase: SupabaseClient,
  albumId: string,
  genre: string,
  subgenre: string
) {
  await supabase.from("album_subgenres").delete().eq("album_id", albumId)
  await supabase.from("album_genres").delete().eq("album_id", albumId)

  if (!genre.trim()) return

  const genreId = await ensureGenre(supabase, genre)
  if (!genreId) return

  await supabase.from("album_genres").insert({ album_id: albumId, genre_id: genreId })

  if (!subgenre.trim()) return

  const subgenreId = await ensureSubgenre(supabase, genreId, subgenre)
  if (!subgenreId) return

  await supabase
    .from("album_subgenres")
    .insert({ album_id: albumId, subgenre_id: subgenreId })
}

export async function updateAlbum(
  supabase: SupabaseClient,
  user: User,
  albumId: string,
  input: UpdateAlbumInput
) {
  const existing = await getAlbumDetailById(supabase, albumId)
  if (!existing) return null

  const releaseYear = parseOptionalInt(input.releaseYear)
  const trackCount = parseOptionalInt(input.trackCount)
  const releaseDate = parseReleaseDate(input.releaseDate)
  const originCountryCode = await resolveOriginCountryCode(
    supabase,
    input.country
  )

  const personalNotes = input.personalNotes.trim()

  const { error } = await supabase
    .from("albums")
    .update({
      title: input.title,
      artist: input.artist,
      release_year: releaseYear,
      release_date: releaseDate,
      track_count: trackCount,
      label: input.label || null,
      record_company: input.recordCompany || null,
      producers: parseProducers(input.producers),
      origin_country_code: originCountryCode,
      personal_notes: personalNotes.length > 0 ? personalNotes : null,
      updated_by: user.id,
    })
    .eq("id", albumId)

  if (error) throw error

  await syncAlbumGenreLinks(supabase, albumId, input.genre, input.subgenre)
  await syncAlbumTags(supabase, user, albumId, input.tags)

  return albumId
}

export async function deleteAlbum(supabase: SupabaseClient, albumId: string) {
  const { data, error: fetchError } = await supabase
    .from("albums")
    .select("id, cover_storage_path")
    .eq("id", albumId)
    .maybeSingle()

  if (fetchError) throw fetchError
  if (!data) return false

  const coverPath = data.cover_storage_path as string | null

  const { error } = await supabase.from("albums").delete().eq("id", albumId)

  if (error) throw error

  if (coverPath?.trim()) {
    try {
      await removeAlbumCover(supabase, coverPath)
    } catch {
      // Album row is already deleted.
    }
  }

  return true
}
