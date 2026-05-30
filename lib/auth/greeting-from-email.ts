export function greetingFromEmail(email: string) {
  const local = email.split("@")[0]?.trim() ?? ""
  if (!local) return "Bienvenue"

  const segment = local.split(/[._-]/)[0] ?? local
  if (!segment) return "Bienvenue"

  return segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase()
}
