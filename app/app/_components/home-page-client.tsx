"use client"

import { useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import { HomeQuickLinks } from "@/app/app/_components/home-quick-links"
import { HomeRecentAlbums } from "@/app/app/_components/home-recent-albums"
import { HomeUpcomingSessions } from "@/app/app/_components/home-upcoming-sessions"
import { greetingFromEmail } from "@/lib/auth/greeting-from-email"
import type { AlbumSummary } from "@/lib/catalog/types"
import type { ProgrammationSession } from "@/lib/programmation/types"

export type HomePageClientProps = {
  email: string
  albumCount: number
  artistCount: number
  recentAlbums: AlbumSummary[]
  upcomingSessions: ProgrammationSession[]
}

export function HomePageClient({
  email,
  albumCount,
  artistCount,
  recentAlbums,
  upcomingSessions,
}: HomePageClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const greeting = greetingFromEmail(email)

  useEffect(() => {
    if (searchParams.get("auth") !== "success") return

    toast.success(`Connecté en tant que ${email}`)

    const next = new URLSearchParams(searchParams.toString())
    next.delete("auth")
    const query = next.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [email, pathname, router, searchParams])

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
      <section className="relative overflow-hidden rounded-2xl border bg-card px-6 py-8 sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="relative space-y-2">
          <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            Accueil
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Bonjour, {greeting}
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
            {albumCount > 0 ? (
              <>
                Le catalogue MINO compte{" "}
                <span className="font-medium text-foreground">
                  {albumCount} album{albumCount > 1 ? "s" : ""}
                </span>
                {artistCount > 0 ? (
                  <>
                    {" "}
                    et{" "}
                    <span className="font-medium text-foreground">
                      {artistCount} artiste{artistCount > 1 ? "s" : ""}
                    </span>
                  </>
                ) : null}
                .
              </>
            ) : (
              "Commence par importer un album pour alimenter la bibliothèque."
            )}
          </p>
        </div>
      </section>

      <HomeQuickLinks albumCount={albumCount} artistCount={artistCount} />
      <HomeRecentAlbums albums={recentAlbums} />
      <HomeUpcomingSessions sessions={upcomingSessions} />
    </div>
  )
}
