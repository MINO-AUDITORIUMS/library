export type MinoRatingSummary = {
  average: number | null
  count: number
}

export function computeMinoRating(
  ratings: number[]
): MinoRatingSummary {
  if (ratings.length === 0) {
    return { average: null, count: 0 }
  }

  const sum = ratings.reduce((total, value) => total + value, 0)
  return {
    average: sum / ratings.length,
    count: ratings.length,
  }
}

export function parseUserRatingBody(body: unknown): number | null | undefined {
  if (!body || typeof body !== "object") return undefined
  const rating = (body as { rating?: unknown }).rating

  if (rating === null) return null

  if (typeof rating === "number" && rating >= 1 && rating <= 5) {
    return rating
  }

  return undefined
}
