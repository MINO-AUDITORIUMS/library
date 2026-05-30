export const MINO_ASSETS_BUCKET = "mino-assets"

export const minoAssetPaths = {
  logoBlack: "brand/Logo_Mino_Black.png",
  logoWhite: "brand/Logo_Mino_White.png",
  pictogramAlterBlack: "brand/Pictogramme_Mino_Alter1_Black.png",
  pictogramAlterWhite: "brand/Pictogramme_Mino_Alter1_White.png",
  pictogramBlack: "brand/Pictogramme_Mino_Black.png",
  pictogramWhite: "brand/Pictogramme_Mino_White.png",
} as const

export type MinoAssetPath =
  (typeof minoAssetPaths)[keyof typeof minoAssetPaths]

export function getMinoAssetPublicUrl(path: MinoAssetPath | string) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "")
  if (!baseUrl) return null
  const normalized = path.replace(/^\//, "")
  return `${baseUrl}/storage/v1/object/public/${MINO_ASSETS_BUCKET}/${normalized}`
}

export function getMinoAssetPublicUrlFromBase(
  supabaseUrl: string,
  path: MinoAssetPath | string
) {
  const baseUrl = supabaseUrl.replace(/\/$/, "")
  const normalized = path.replace(/^\//, "")
  return `${baseUrl}/storage/v1/object/public/${MINO_ASSETS_BUCKET}/${normalized}`
}
