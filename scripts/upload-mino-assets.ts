import { readFileSync, existsSync } from "node:fs"
import { basename, resolve } from "node:path"

import { createClient } from "@supabase/supabase-js"

import {
  getMinoAssetPublicUrlFromBase,
  minoAssetPaths,
} from "../lib/catalog/storage/mino-assets"

const BRAND_PREFIX = "brand"

const uploadManifest = [
  { local: "Logo_Mino_Black.png", remote: minoAssetPaths.logoBlack },
  { local: "Logo_Mino_White.png", remote: minoAssetPaths.logoWhite },
  {
    local: "Pictogramme_Mino_Alter1_Black.png",
    remote: minoAssetPaths.pictogramAlterBlack,
  },
  {
    local: "Pictogramme_Mino_Alter1_White.png",
    remote: minoAssetPaths.pictogramAlterWhite,
  },
  { local: "Pictogramme_Mino_Black.png", remote: minoAssetPaths.pictogramBlack },
  { local: "Pictogramme_Mino_White.png", remote: minoAssetPaths.pictogramWhite },
] as const

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) return

  const content = readFileSync(filePath, "utf8")
  for (const line of content.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const separator = trimmed.indexOf("=")
    if (separator <= 0) continue
    const key = trimmed.slice(0, separator).trim()
    const value = trimmed.slice(separator + 1).trim()
    if (key && process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

function mimeTypeForFile(fileName: string) {
  const lower = fileName.toLowerCase()
  if (lower.endsWith(".png")) return "image/png"
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg"
  if (lower.endsWith(".webp")) return "image/webp"
  if (lower.endsWith(".gif")) return "image/gif"
  if (lower.endsWith(".svg")) return "image/svg+xml"
  return "application/octet-stream"
}

function usage() {
  console.log(`Usage:
  pnpm assets:upload-mino

Requires:
  NEXT_PUBLIC_SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY

Creates/updates files in bucket "mino-assets" under ${BRAND_PREFIX}/.
Run "pnpm db:schema" first if the bucket does not exist yet.`)
}

async function main() {
  loadEnvFile(resolve(process.cwd(), ".env.local"))
  loadEnvFile(resolve(process.cwd(), ".env"))

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    console.error(
      "NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis."
    )
    usage()
    process.exit(1)
  }

  const publicDir = resolve(process.cwd(), "public")
  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: bucket, error: bucketError } =
    await supabase.storage.getBucket("mino-assets")

  if (bucketError || !bucket) {
    console.error(
      'Bucket "mino-assets" introuvable. Lance d\'abord : pnpm db:schema'
    )
    process.exit(1)
  }

  console.log(`Upload vers mino-assets/${BRAND_PREFIX}/…\n`)

  for (const item of uploadManifest) {
    const localPath = resolve(publicDir, item.local)
    if (!existsSync(localPath)) {
      console.error(`Fichier manquant : ${localPath}`)
      process.exit(1)
    }

    const bytes = readFileSync(localPath)
    const contentType = mimeTypeForFile(item.local)

    const { error } = await supabase.storage
      .from("mino-assets")
      .upload(item.remote, bytes, {
        contentType,
        upsert: true,
        cacheControl: "31536000",
      })

    if (error) {
      console.error(`Échec ${item.local} → ${error.message}`)
      process.exit(1)
    }

    const publicUrl = getMinoAssetPublicUrlFromBase(url, item.remote)
    console.log(`✓ ${basename(item.local)}`)
    console.log(`  ${publicUrl}\n`)
  }

  console.log("Terminé. Utilise ces URLs dans les templates email Supabase.")
  console.log(
    `Pictogramme (emails) : ${getMinoAssetPublicUrlFromBase(url, minoAssetPaths.pictogramAlterBlack)}`
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
