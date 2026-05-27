export const routes = {
  home: "/",
  connexion: "/connexion",
  bibliotheque: "/bibliotheque",
  authCallback: "/auth/callback",
} as const

export type AppRoute = (typeof routes)[keyof typeof routes]
