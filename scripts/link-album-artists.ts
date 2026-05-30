import { readFileSync, existsSync } from "node:fs"
import { resolve } from "node:path"

import { createClient } from "@supabase/supabase-js"

import { primaryDiscogsArtistFromRelease } from "../lib/catalog/discogs/fetch-artist"
import { discogsFetch } from "../lib/catalog/discogs/client"
import { resolveOrCreateArtist } from "../lib/catalog/db/artists"
import { discogsIdFromExternalIds } from "../lib/catalog/external-ids"

type AlbumRow = {
  id: string
  title: string
  artist: string
  external_ids: Record<string, unknown>
}

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

function usage() {
  console.log(`Usage:
  pnpm db:link-artists
  pnpm db:link-artists -- --dry-run

Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL.
Links albums to artists using Discogs release artist IDs (no name matching).`)
}

async function main() {
  loadEnvFile(resolve(process.cwd(), ".env.local"))
  loadEnvFile(resolve(process.cwd(), ".env"))

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const dryRun = process.argv.includes("--dry-run")

  if (!url || !serviceRoleKey) {
    console.error(
      "NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis."
    )
    usage()
    process.exit(1)
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data, error } = await supabase
    .from("albums")
    .select("id, title, artist, external_ids")
    .is("artist_id", null)
    .order("created_at", { ascending: true })

  if (error) throw error

  const albums = (data ?? []) as AlbumRow[]
  const eligible = albums.filter(
    (album) => discogsIdFromExternalIds(album.external_ids) !== null
  )

  console.log(
    `${eligible.length} album(s) sans artist_id mais avec release Discogs.`
  )

  if (dryRun) {
    for (const album of eligible) {
      console.log(`- ${album.artist} — ${album.title} (${album.id})`)
    }
    return
  }

  let linked = 0
  let skipped = 0
  let failed = 0

  for (const album of eligible) {
    const releaseId = discogsIdFromExternalIds(album.external_ids)
    if (!releaseId) continue

    process.stdout.write(`→ ${album.title}… `)

    try {
      const release = await discogsFetch<unknown>({
        path: `/releases/${releaseId}`,
      })
      const primary = primaryDiscogsArtistFromRelease(release)

      if (!primary?.discogsArtistId) {
        skipped += 1
        console.log("ignoré (pas d'artiste principal Discogs)")
        continue
      }

      const artistId = await resolveOrCreateArtist(supabase, {
        name: primary.name || album.artist,
        discogsArtistId: primary.discogsArtistId,
        musicbrainzArtistId: null,
      })

      if (!artistId) {
        skipped += 1
        console.log("ignoré (artiste non résolu)")
        continue
      }

      const { error: updateError } = await supabase
        .from("albums")
        .update({ artist_id: artistId })
        .eq("id", album.id)

      if (updateError) throw updateError

      linked += 1
      console.log(`ok (${primary.name})`)
    } catch (err) {
      failed += 1
      console.log(
        `échec (${err instanceof Error ? err.message : "erreur inconnue"})`
      )
    }
  }

  console.log(`Terminé : ${linked} lié(s), ${skipped} ignoré(s), ${failed} échec(s).`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
