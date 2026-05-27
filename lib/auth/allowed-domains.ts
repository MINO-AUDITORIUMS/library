export const ALLOWED_EMAIL_DOMAINS = [
  "mino.co",
  "imagine-nation.co",
  "pm.me",
] as const

export type AllowedEmailDomain = (typeof ALLOWED_EMAIL_DOMAINS)[number]

export function getEmailDomain(email: string) {
  const at = email.lastIndexOf("@")
  if (at < 0) return null
  const domain = email
    .slice(at + 1)
    .trim()
    .toLowerCase()
  return domain.length ? domain : null
}

export function isAllowedEmail(email: string) {
  const domain = getEmailDomain(email)
  if (!domain) return false
  return ALLOWED_EMAIL_DOMAINS.includes(domain as AllowedEmailDomain)
}
