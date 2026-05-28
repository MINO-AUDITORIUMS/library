export const routes = {
  home: "/",
  connexion: "/connexion",
  app: "/app",
  bibliotheque: "/bibliotheque",
  bibliothequeNew: "/bibliotheque/nouveau",
  authCallback: "/auth/callback",
} as const

export function albumDetailRoute(id: string) {
  return `/bibliotheque/${id}` as const
}

export type AppRoute = (typeof routes)[keyof typeof routes]
