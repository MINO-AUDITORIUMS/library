import { routes } from "@/lib/routes"

export function buildAuthCallbackUrl(nextPath: string = routes.app) {
  if (typeof window === "undefined") {
    throw new Error("buildAuthCallbackUrl must run in the browser")
  }

  const callback = new URL(routes.authCallback, window.location.origin)
  callback.searchParams.set("next", nextPath)
  return callback.toString()
}
