# LIBRARY

Catalogue collaboratif d'albums (MINO / Imagine Nation) — Next.js, Supabase, Shadcn UI.

## Démarrage

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Configurer `.env.local` :

- Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
- Discogs (`DISCOGS_TOKEN` ou `DISCOGS_CONSUMER_KEY` + `DISCOGS_CONSUMER_SECRET`)
- MusicBrainz (`MUSICBRAINZ_USER_AGENT`)

Appliquer le schéma base :

```bash
pnpm db:schema
```

## Documentation

| Document | Contenu |
|----------|---------|
| [docs/catalog-apis.md](./docs/catalog-apis.md) | APIs Discogs & MusicBrainz, fusion des données, routes internes, pays, limites |
| [supabase/schema/README.md](./supabase/schema/README.md) | Modèle PostgreSQL, ordre d'application du schéma |

## Stack

- **Next.js 16** (App Router)
- **Supabase** (auth, PostgreSQL, storage)
- **Shadcn UI** + Tailwind CSS v4
- **Discogs API** + **MusicBrainz API** pour l'import catalogue

## Scripts

| Commande | Description |
|----------|-------------|
| `pnpm dev` | Serveur de développement |
| `pnpm build` | Build production |
| `pnpm typecheck` | Vérification TypeScript |
| `pnpm db:schema` | Appliquer le schéma Supabase |
| `pnpm db:schema:reset` | Reset + réapplication du schéma |
| `pnpm db:sync-tracks -- --all` | Resynchroniser les tracklists (crédits inclus) en batch |
| `pnpm assets:upload-mino` | Upload logos MINO vers le bucket Supabase `mino-assets` |
| `pnpm db:link-artists` | Relie les albums existants aux fiches artistes via Discogs |
