import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { createClient } from "@supabase/supabase-js"

import { hasTrackImportSources } from "../lib/catalog/external-ids"
import {
  SyncAlbumTracksError,
  syncAlbumTracks,
} from "../lib/catalog/sync-album-tracks"

type AlbumRow = {
  id: string
  title: string
  artist: string
  external_ids: Record<string, unknown>
}

function loadEnvFile(filePath: string) {
  let content: string
  try {
    content = readFileSync(filePath, "utf8")
  } catch {
    return
  }

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

function parseArgs(argv: string[]) {
  const ids: string[] = []
  let all = false
  let dryRun = false

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === "--all") {
      all = true
      continue
    }
    if (arg === "--dry-run") {
      dryRun = true
      continue
    }
    if (arg === "--id") {
      const value = argv[index + 1]
      if (value) {
        ids.push(value)
        index += 1
      }
    }
  }

  return { ids, all, dryRun }
}

function usage() {
  console.log(`Usage:
  pnpm db:sync-tracks -- --id <album-uuid>
  pnpm db:sync-tracks -- --all
  pnpm db:sync-tracks -- --all --dry-run

Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in .env.local.`)
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
    process.exit(1)
  }

  const { ids, all, dryRun } = parseArgs(process.argv.slice(2))

  if (!all && ids.length === 0) {
    usage()
    process.exit(1)
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  let albums: AlbumRow[] = []

  if (ids.length > 0) {
    const { data, error } = await supabase
      .from("albums")
      .select("id, title, artist, external_ids")
      .in("id", ids)

    if (error) throw error
    albums = (data ?? []) as AlbumRow[]
  } else {
    const { data, error } = await supabase
      .from("albums")
      .select("id, title, artist, external_ids")
      .order("created_at", { ascending: true })

    if (error) throw error
    albums = ((data ?? []) as AlbumRow[]).filter((album) =>
      hasTrackImportSources(album.external_ids)
    )
  }

  if (albums.length === 0) {
    console.log("Aucun album éligible.")
    return
  }

  console.log(`${albums.length} album(s) à traiter.`)

  if (dryRun) {
    for (const album of albums) {
      console.log(`- ${album.title} — ${album.artist} (${album.id})`)
    }
    return
  }

  let synced = 0
  let failed = 0

  for (const album of albums) {
    process.stdout.write(`→ ${album.title}… `)

    if (!hasTrackImportSources(album.external_ids)) {
      console.log("ignoré (aucune source)")
      continue
    }

    try {
      const result = await syncAlbumTracks(supabase, album.id)
      synced += 1
      console.log(
        `ok (${result.trackCount} pistes, ${result.tracksWithWriters} writers, ${result.tracksWithProducers} producers)`
      )
    } catch (error) {
      failed += 1
      if (error instanceof SyncAlbumTracksError) {
        console.log(`échec (${error.message})`)
      } else if (error instanceof Error) {
        console.log(`échec (${error.message})`)
      } else {
        console.log("échec")
      }
    }
  }

  console.log(`Terminé : ${synced} synchronisé(s), ${failed} échec(s).`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
