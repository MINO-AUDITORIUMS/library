import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { createClient } from "@supabase/supabase-js"

import { stripCatalogDisambiguation } from "../lib/catalog/normalize-artist-name"
import { uniqueCreditNames } from "../lib/catalog/track-credits"

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

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: albums, error: albumsError } = await supabase
    .from("albums")
    .select("id, title, artist, label, record_company, producers")

  if (albumsError) throw albumsError

  let albumsUpdated = 0

  for (const album of albums ?? []) {
    const title = stripCatalogDisambiguation(album.title as string)
    const artist = stripCatalogDisambiguation(album.artist as string)
    const label = stripCatalogDisambiguation((album.label as string | null) ?? "")
    const recordCompany = stripCatalogDisambiguation(
      (album.record_company as string | null) ?? ""
    )
    const producers = uniqueCreditNames((album.producers as string[]) ?? [])

    if (
      title === album.title &&
      artist === album.artist &&
      label === ((album.label as string | null) ?? "") &&
      recordCompany === ((album.record_company as string | null) ?? "") &&
      producers.length === ((album.producers as string[]) ?? []).length &&
      producers.every(
        (name, index) => name === ((album.producers as string[]) ?? [])[index]
      )
    ) {
      continue
    }

    const { error } = await supabase
      .from("albums")
      .update({
        title,
        artist,
        label: label || null,
        record_company: recordCompany || null,
        producers,
      })
      .eq("id", album.id)

    if (error) throw error
    albumsUpdated += 1
  }

  const { data: artists, error: artistsError } = await supabase
    .from("artists")
    .select("id, name")

  if (artistsError) throw artistsError

  let artistsUpdated = 0

  for (const artist of artists ?? []) {
    const name = stripCatalogDisambiguation(artist.name as string)
    if (name === artist.name) continue

    const { error } = await supabase
      .from("artists")
      .update({ name })
      .eq("id", artist.id)

    if (error) throw error
    artistsUpdated += 1
  }

  const { data: tracks, error: tracksError } = await supabase
    .from("album_tracks")
    .select("id, writers, producers")

  if (tracksError) throw tracksError

  let tracksUpdated = 0

  for (const track of tracks ?? []) {
    const writers = uniqueCreditNames((track.writers as string[]) ?? [])
    const producers = uniqueCreditNames((track.producers as string[]) ?? [])
    const previousWriters = (track.writers as string[]) ?? []
    const previousProducers = (track.producers as string[]) ?? []

    if (
      writers.length === previousWriters.length &&
      producers.length === previousProducers.length &&
      writers.every((name, index) => name === previousWriters[index]) &&
      producers.every((name, index) => name === previousProducers[index])
    ) {
      continue
    }

    const { error } = await supabase
      .from("album_tracks")
      .update({ writers, producers })
      .eq("id", track.id)

    if (error) throw error
    tracksUpdated += 1
  }

  console.log(
    `Terminé : ${albumsUpdated} album(s), ${artistsUpdated} artiste(s) et ${tracksUpdated} piste(s) mis à jour.`
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
