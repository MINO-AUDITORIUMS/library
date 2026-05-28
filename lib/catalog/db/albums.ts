import type { SupabaseClient, User } from "@supabase/supabase-js"

import { ensureProfile } from "@/lib/auth/ensure-profile"

import { resolveCountryCode } from "@/lib/catalog/country-code"
import {
  coverHueFromId,
  coverImageFromExternalIds,
} from "@/lib/catalog/cover-hue"
import type { CreateAlbumInput } from "@/lib/catalog/create-album-input"
import {
  parseOptionalInt,
  parseProducers,
  parseReleaseDate,
} from "@/lib/catalog/create-album-input"
import { discogsFetch } from "@/lib/catalog/discogs/client"
import { parseDiscogsDuration } from "@/lib/catalog/discogs/parse-duration"
import { slugify } from "@/lib/catalog/slug"
import type {
  AlbumDetail,
  AlbumFormat,
  AlbumSummary,
  AlbumTrack,
} from "@/lib/catalog/types"

type AlbumRow = {
  id: string
  title: string
  artist: string
  release_year: number | null
  release_date: string | null
  description: string | null
  total_duration_seconds: number | null
  track_count: number | null
  format: AlbumFormat | null
  label: string | null
  record_company: string | null
  producers: string[]
  origin_country_code: string | null
  certification: string | null
  official_clips_count: number
  rating: number | null
  personal_notes: string | null
  external_ids: Record<string, unknown>
  created_at: string
  countries: { name: string } | { name: string }[] | null
  album_genres: { genres: { name: string } | { name: string }[] | null }[] | null
  album_subgenres:
    | { subgenres: { name: string } | { name: string }[] | null }[]
    | null
  album_tags: { tags: { name: string } | { name: string }[] | null }[] | null
  album_tracks:
    | {
        position: number
        title: string
        duration_seconds: number | null
      }[]
    | null
}

const albumListSelect = `
  id,
  title,
  artist,
  release_year,
  format,
  rating,
  label,
  external_ids,
  album_genres(genres(name)),
  album_subgenres(subgenres(name)),
  album_tags(tags(name))
`

const albumDetailSelect = `
  id,
  title,
  artist,
  release_year,
  release_date,
  description,
  total_duration_seconds,
  track_count,
  format,
  label,
  record_company,
  producers,
  origin_country_code,
  certification,
  official_clips_count,
  rating,
  personal_notes,
  external_ids,
  created_at,
  countries(name),
  album_genres(genres(name)),
  album_subgenres(subgenres(name)),
  album_tags(tags(name)),
  album_tracks(position, title, duration_seconds)
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
    }))
}

export function mapAlbumSummary(row: AlbumRow): AlbumSummary {
  const genre = firstGenre(row) || firstSubgenre(row) || "—"
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    releaseYear: row.release_year ?? 0,
    label: row.label ?? "—",
    format: row.format ?? "other",
    rating: row.rating,
    tags: mapTags(row),
    genre,
    coverHue: coverHueFromId(row.id),
    coverImageUrl: coverImageFromExternalIds(row.external_ids),
  }
}

export function mapAlbumDetail(row: AlbumRow): AlbumDetail {
  const summary = mapAlbumSummary(row)
  const tracks = mapTracks(row.album_tracks)
  const totalDuration =
    row.total_duration_seconds ??
    tracks.reduce((sum, track) => sum + (track.durationSeconds ?? 0), 0)

  return {
    ...summary,
    releaseDate: row.release_date,
    subgenre: firstSubgenre(row) || "—",
    recordCompany: row.record_company ?? "—",
    producers: row.producers.length > 0 ? row.producers : ["—"],
    country: readCountry(row) || row.origin_country_code || "—",
    certification: row.certification,
    trackCount: row.track_count ?? tracks.length,
    totalDurationSeconds: totalDuration,
    description: row.description?.trim() || "—",
    personalNotes: row.personal_notes?.trim() ?? "",
    tracks,
    officialClipsCount: row.official_clips_count,
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

type RawDiscogsTrack = {
  position?: string
  title?: string
  duration?: string
}

async function resolveOriginCountryCode(
  supabase: SupabaseClient,
  country: string
) {
  const code = resolveCountryCode(country)
  if (!code) return null

  const { data, error } = await supabase
    .from("countries")
    .select("code")
    .eq("code", code)
    .maybeSingle()

  if (error) throw error
  return data?.code ?? null
}

async function fetchDiscogsTracks(releaseId: number) {
  const data = await discogsFetch<{ tracklist?: RawDiscogsTrack[] }>({
    path: `/releases/${releaseId}`,
  })

  const tracks = data.tracklist ?? []
  const parsed: {
    position: number
    title: string
    duration_seconds: number | null
  }[] = []

  let index = 0
  for (const track of tracks) {
    const title = track.title?.trim()
    if (!title || title.toLowerCase() === "video") continue
    index += 1
    const position = Number.parseInt(track.position ?? "", 10)
    parsed.push({
      position: Number.isFinite(position) ? position : index,
      title,
      duration_seconds: parseDiscogsDuration(track.duration),
    })
  }

  return parsed
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

  const externalIds: Record<string, unknown> = {}
  if (input.discogsReleaseId) externalIds.discogs = input.discogsReleaseId
  if (input.coverImageUrl) externalIds.discogs_thumb = input.coverImageUrl

  const { data: album, error } = await supabase
    .from("albums")
    .insert({
      title: input.title,
      artist: input.artist,
      release_year: releaseYear,
      release_date: releaseDate,
      description: input.description.trim() || null,
      track_count: trackCount,
      format: input.format,
      label: input.label || null,
      record_company: input.recordCompany || null,
      producers: parseProducers(input.producers),
      origin_country_code: originCountryCode,
      rating: input.rating,
      personal_notes: input.personalNotes.trim() || null,
      external_ids: externalIds,
      created_by: user.id,
      updated_by: user.id,
    })
    .select("id")
    .single()

  if (error) throw error

  const albumId = album.id as string

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

  if (input.discogsReleaseId) {
    try {
      const tracks = await fetchDiscogsTracks(input.discogsReleaseId)
      if (tracks.length > 0) {
        await supabase.from("album_tracks").insert(
          tracks.map((track) => ({
            album_id: albumId,
            position: track.position,
            title: track.title,
            duration_seconds: track.duration_seconds,
          }))
        )

        const totalDuration = tracks.reduce(
          (sum, track) => sum + (track.duration_seconds ?? 0),
          0
        )

        await supabase
          .from("albums")
          .update({
            track_count: tracks.length,
            total_duration_seconds:
              totalDuration > 0 ? totalDuration : null,
          })
          .eq("id", albumId)
      }
    } catch {
      // Discogs tracklist is optional; album row is already created.
    }
  }

  return albumId
}
