#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if ! command -v supabase >/dev/null 2>&1; then
  echo "Supabase CLI introuvable. Installe-la : brew install supabase/tap/supabase"
  exit 1
fi

RESET=false
YES=false
QUERY_FLAGS=()

for arg in "$@"; do
  case "$arg" in
    --reset) RESET=true ;;
    --yes) YES=true ;;
    --linked) QUERY_FLAGS=(--linked) ;;
    --local) QUERY_FLAGS=(--local) ;;
  esac
done

if [[ ${#QUERY_FLAGS[@]} -eq 0 && -z "${DATABASE_URL:-}" ]]; then
  echo "Usage:"
  echo "  ./supabase/apply_schema.sh --linked              # applique le schéma"
  echo "  ./supabase/apply_schema.sh --linked --reset      # supprime puis réapplique"
  echo "  ./supabase/apply_schema.sh --linked --reset --yes"
  echo "  ./supabase/apply_schema.sh --local"
  echo "  DATABASE_URL=... ./supabase/apply_schema.sh --reset --yes"
  exit 1
fi

FILES=(
  supabase/schema/set_updated_at.sql
  supabase/schema/profiles.sql
  supabase/schema/countries.sql
  supabase/schema/lyrics_languages.sql
  supabase/schema/genres.sql
  supabase/schema/subgenres.sql
  supabase/schema/tags.sql
  supabase/schema/location_types.sql
  supabase/schema/locations.sql
  supabase/schema/location_rooms.sql
  supabase/schema/project_types.sql
  supabase/schema/project_statuses.sql
  supabase/schema/artists.sql
  supabase/schema/artists_image_storage.sql
  supabase/schema/albums.sql
  supabase/schema/album_drop_format.sql
  supabase/schema/album_artist_fk.sql
  supabase/schema/album_tracks.sql
  supabase/schema/album_track_credits.sql
  supabase/schema/album_track_videos.sql
  supabase/schema/album_rename_official_videos.sql
  supabase/schema/album_video_clips.sql
  supabase/schema/album_tags.sql
  supabase/schema/album_genres.sql
  supabase/schema/album_subgenres.sql
  supabase/schema/album_lyrics_languages.sql
  supabase/schema/album_comments.sql
  supabase/schema/album_user_ratings.sql
  supabase/schema/album_attachments.sql
  supabase/schema/album_search.sql
  supabase/schema/library_list.sql
  supabase/schema/album_drop_description.sql
  supabase/schema/seances.sql
  supabase/schema/projects.sql
  supabase/schema/budget_categories.sql
  supabase/schema/project_budgets.sql
  supabase/schema/project_budget_lines.sql
  supabase/schema/project_ticket_lines.sql
  supabase/schema/grants_api_roles.sql
  supabase/storage/album_attachments.sql
  supabase/storage/album_covers.sql
  supabase/storage/artist_images.sql
  supabase/storage/mino_assets.sql
  supabase/seed/lookups.sql
)

run_file() {
  local file="$1"
  echo "→ $file"
  if [[ -n "${DATABASE_URL:-}" ]]; then
    psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$file"
  else
    supabase db query "${QUERY_FLAGS[@]}" -f "$file"
  fi
}

if [[ -n "${DATABASE_URL:-}" ]]; then
  if ! command -v psql >/dev/null 2>&1; then
    echo "psql introuvable (brew install libpq)"
    exit 1
  fi
fi

if [[ "$RESET" == true ]]; then
  if [[ "$YES" != true ]]; then
    echo "⚠️  --reset supprime toutes les tables LIBRARY (albums, tags, profils app, etc.)."
    read -r -p "Continuer ? [y/N] " reply
    if [[ ! "$reply" =~ ^[Yy]$ ]]; then
      echo "Annulé."
      exit 0
    fi
  fi
  run_file supabase/drop_schema.sql
fi

for file in "${FILES[@]}"; do
  run_file "$file"
done

echo "Schéma appliqué."
