import type { SupabaseClient, User } from "@supabase/supabase-js"

export async function ensureProfile(supabase: SupabaseClient, user: User) {
  const { data: existing, error: readError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle()

  if (readError) throw readError
  if (existing) return

  const meta = user.user_metadata ?? {}

  const { error: insertError } = await supabase.from("profiles").insert({
    id: user.id,
    email: user.email ?? null,
    full_name:
      (typeof meta.full_name === "string" && meta.full_name) ||
      (typeof meta.name === "string" && meta.name) ||
      null,
    avatar_url:
      (typeof meta.avatar_url === "string" && meta.avatar_url) ||
      (typeof meta.picture === "string" && meta.picture) ||
      null,
  })

  if (insertError) throw insertError
}
