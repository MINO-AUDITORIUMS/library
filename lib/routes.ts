export const routes = {
  home: "/",
  connexion: "/connexion",
  app: "/app",
  bibliotheque: "/bibliotheque",
  bibliothequeNew: "/bibliotheque/nouveau",
  artistes: "/artistes",
  authCallback: "/auth/callback",
} as const

export function albumDetailRoute(id: string) {
  return `/bibliotheque/${id}` as const
}

export function albumEditRoute(id: string) {
  return `/bibliotheque/${id}/modifier` as const
}

export function artistDetailRoute(id: string) {
  return `/artistes/${id}` as const
}

export type AppRoute = (typeof routes)[keyof typeof routes]
