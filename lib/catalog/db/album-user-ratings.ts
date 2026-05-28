import type { SupabaseClient, User } from "@supabase/supabase-js"

import { ensureProfile } from "@/lib/auth/ensure-profile"
import {
  computeMinoRating,
  type MinoRatingSummary,
} from "@/lib/catalog/ratings"

type RatingRow = {
  user_id: string
  rating: number
}

export type AlbumRatingsSnapshot = {
  myRating: number | null
  minoRating: MinoRatingSummary
}

function mapSnapshot(
  rows: RatingRow[],
  userId: string
): AlbumRatingsSnapshot {
  const values = rows.map((row) => row.rating)
  const mine = rows.find((row) => row.user_id === userId)?.rating ?? null

  return {
    myRating: mine,
    minoRating: computeMinoRating(values),
  }
}

export async function getAlbumRatingsSnapshot(
  supabase: SupabaseClient,
  albumId: string,
  userId: string
): Promise<AlbumRatingsSnapshot> {
  const { data, error } = await supabase
    .from("album_user_ratings")
    .select("user_id, rating")
    .eq("album_id", albumId)

  if (error) throw error
  return mapSnapshot((data ?? []) as RatingRow[], userId)
}

export async function setAlbumUserRating(
  supabase: SupabaseClient,
  user: User,
  albumId: string,
  rating: number | null
) {
  await ensureProfile(supabase, user)

  if (rating === null) {
    const { error } = await supabase
      .from("album_user_ratings")
      .delete()
      .eq("album_id", albumId)
      .eq("user_id", user.id)

    if (error) throw error
    return getAlbumRatingsSnapshot(supabase, albumId, user.id)
  }

  const { error } = await supabase.from("album_user_ratings").upsert(
    {
      album_id: albumId,
      user_id: user.id,
      rating,
    },
    { onConflict: "album_id,user_id" }
  )

  if (error) throw error
  return getAlbumRatingsSnapshot(supabase, albumId, user.id)
}

export function minoRatingFromRows(
  rows: { rating: number }[] | null | undefined
): MinoRatingSummary {
  return computeMinoRating((rows ?? []).map((row) => row.rating))
}
