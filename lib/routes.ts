export const routes = {
  home: "/",
  connexion: "/connexion",
  app: "/app",
  bibliotheque: "/bibliotheque",
  authCallback: "/auth/callback",
} as const

export type AppRoute = (typeof routes)[keyof typeof routes]
