import type { SupabaseClient } from "@supabase/supabase-js"

import {
  discogsIdFromExternalIds,
  musicbrainzIdFromExternalIds,
  spotifyIdFromExternalIds,
} from "@/lib/catalog/external-ids"
import {
  persistAlbumTracks,
  type PersistAlbumTracksResult,
} from "@/lib/catalog/persist-album-tracks"
import { resolveAlbumCoverUrl } from "@/lib/catalog/resolve-album-cover"
import { resolveImportTracks } from "@/lib/catalog/resolve-import-tracks"
import {
  removeAlbumCover,
  uploadAlbumCoverFromUrl,
} from "@/lib/catalog/storage/album-cover"

export type SyncAlbumTracksResult = PersistAlbumTracksResult

export class SyncAlbumTracksError extends Error {
  code: "not_found" | "no_sources" | "no_tracks"

  constructor(message: string, code: SyncAlbumTracksError["code"]) {
    super(message)
    this.name = "SyncAlbumTracksError"
    this.code = code
  }
}

function mergeExternalIds(
  current: Record<string, unknown>,
  resolved: {
    spotifyAlbumId: string | null
    discogsReleaseId: number | null
    musicbrainzReleaseId: string | null
  }
) {
  const next = { ...current }

  if (resolved.spotifyAlbumId) {
    next.spotify = resolved.spotifyAlbumId
  }
  if (resolved.discogsReleaseId) {
    next.discogs = resolved.discogsReleaseId
  }
  if (resolved.musicbrainzReleaseId) {
    next.musicbrainz = resolved.musicbrainzReleaseId
  }

  return next
}

export async function syncAlbumTracks(
  supabase: SupabaseClient,
  albumId: string
): Promise<SyncAlbumTracksResult> {
  const { data: album, error } = await supabase
    .from("albums")
    .select("id, title, artist, external_ids, cover_storage_path")
    .eq("id", albumId)
    .maybeSingle()

  if (error) throw error
  if (!album) {
    throw new SyncAlbumTracksError("Album introuvable.", "not_found")
  }

  const externalIds = (album.external_ids as Record<string, unknown>) ?? {}
  const spotifyAlbumId = spotifyIdFromExternalIds(externalIds)
  const discogsReleaseId = discogsIdFromExternalIds(externalIds)
  const musicbrainzReleaseId = musicbrainzIdFromExternalIds(externalIds)
  const albumTitle = album.title as string
  const albumArtist = album.artist as string

  if (
    !spotifyAlbumId &&
    !discogsReleaseId &&
    !musicbrainzReleaseId &&
    (!albumTitle.trim() || !albumArtist.trim())
  ) {
    throw new SyncAlbumTracksError(
      "Aucune source Spotify, Discogs ou MusicBrainz liée à cet album.",
      "no_sources"
    )
  }

  const { tracks, sources } = await resolveImportTracks({
    spotifyAlbumId,
    discogsReleaseId,
    musicbrainzReleaseId,
    albumTitle,
    albumArtist,
  })

  if (tracks.length === 0) {
    throw new SyncAlbumTracksError(
      "Aucune piste trouvée sur les sources liées.",
      "no_tracks"
    )
  }

  const nextExternalIds = mergeExternalIds(externalIds, sources)
  const externalIdsChanged =
    JSON.stringify(nextExternalIds) !== JSON.stringify(externalIds)

  if (externalIdsChanged) {
    const { error: updateError } = await supabase
      .from("albums")
      .update({ external_ids: nextExternalIds })
      .eq("id", albumId)

    if (updateError) throw updateError
  }

  const coverUrl = await resolveAlbumCoverUrl(sources)
  if (coverUrl) {
    try {
      const previousCoverPath =
        (album.cover_storage_path as string | null) ?? null
      const coverPath = await uploadAlbumCoverFromUrl(supabase, albumId, coverUrl)
      if (coverPath) {
        await supabase
          .from("albums")
          .update({ cover_storage_path: coverPath })
          .eq("id", albumId)

        if (previousCoverPath && previousCoverPath !== coverPath) {
          try {
            await removeAlbumCover(supabase, previousCoverPath)
          } catch {
          }
        }
      }
    } catch {
    }
  }

  return persistAlbumTracks(supabase, albumId, tracks)
}
