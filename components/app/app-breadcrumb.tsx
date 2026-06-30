"use client"

import { Fragment, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { routes } from "@/lib/routes"

type Crumb = {
  label: string
  href?: string
}

function buildCrumbs(
  pathname: string,
  albumTitle: string | null,
  artistTitle: string | null
): Crumb[] {
  if (pathname === routes.app) {
    return [{ label: "Accueil" }]
  }

  if (pathname === routes.bibliotheque) {
    return [
      { label: "Accueil", href: routes.app },
      { label: "Bibliothèque" },
    ]
  }

  if (pathname === routes.bibliothequeNew) {
    return [
      { label: "Accueil", href: routes.app },
      { label: "Bibliothèque", href: routes.bibliotheque },
      { label: "Nouvel album" },
    ]
  }

  if (pathname === routes.artistes) {
    return [
      { label: "Accueil", href: routes.app },
      { label: "Artistes" },
    ]
  }

  if (pathname === routes.programmation) {
    return [
      { label: "Accueil", href: routes.app },
      { label: "Programmation" },
    ]
  }

  const artistMatch = pathname.match(/^\/artistes\/([^/]+)$/)
  if (artistMatch) {
    return [
      { label: "Accueil", href: routes.app },
      { label: "Artistes", href: routes.artistes },
      { label: artistTitle ?? "Artiste" },
    ]
  }

  const albumEditMatch = pathname.match(/^\/bibliotheque\/([^/]+)\/modifier$/)
  if (albumEditMatch && albumEditMatch[1] !== "nouveau") {
    return [
      { label: "Accueil", href: routes.app },
      { label: "Bibliothèque", href: routes.bibliotheque },
      {
        label: albumTitle ?? "Album",
        href: `/bibliotheque/${albumEditMatch[1]}`,
      },
      { label: "Modifier" },
    ]
  }

  const albumMatch = pathname.match(/^\/bibliotheque\/([^/]+)$/)
  if (albumMatch && albumMatch[1] !== "nouveau") {
    return [
      { label: "Accueil", href: routes.app },
      { label: "Bibliothèque", href: routes.bibliotheque },
      { label: albumTitle ?? "Album" },
    ]
  }

  return [{ label: "Accueil", href: routes.app }]
}

export function AppBreadcrumb() {
  const pathname = usePathname()
  const [albumTitle, setAlbumTitle] = useState<string | null>(null)
  const [artistTitle, setArtistTitle] = useState<string | null>(null)

  const albumId = useMemo(() => {
    const editMatch = pathname.match(/^\/bibliotheque\/([^/]+)\/modifier$/)
    if (editMatch && editMatch[1] !== "nouveau") return editMatch[1]

    const match = pathname.match(/^\/bibliotheque\/([^/]+)$/)
    if (!match || match[1] === "nouveau") return null
    return match[1]
  }, [pathname])

  const artistId = useMemo(() => {
    const match = pathname.match(/^\/artistes\/([^/]+)$/)
    return match?.[1] ?? null
  }, [pathname])

  useEffect(() => {
    if (!albumId) {
      setAlbumTitle(null)
      return
    }

    let cancelled = false

    async function loadTitle() {
      try {
        const response = await fetch(`/api/albums/${albumId}?titleOnly=1`)
        const data = (await response.json()) as { title?: string }
        if (!cancelled && response.ok && data.title) {
          setAlbumTitle(data.title)
        }
      } catch {
        if (!cancelled) setAlbumTitle(null)
      }
    }

    loadTitle()
    return () => {
      cancelled = true
    }
  }, [albumId])

  useEffect(() => {
    if (!artistId) {
      setArtistTitle(null)
      return
    }

    let cancelled = false

    async function loadTitle() {
      try {
        const response = await fetch(`/api/artists/${artistId}?titleOnly=1`)
        const data = (await response.json()) as { title?: string }
        if (!cancelled && response.ok && data.title) {
          setArtistTitle(data.title)
        }
      } catch {
        if (!cancelled) setArtistTitle(null)
      }
    }

    loadTitle()
    return () => {
      cancelled = true
    }
  }, [artistId])

  const crumbs = useMemo(
    () => buildCrumbs(pathname, albumTitle, artistTitle),
    [pathname, albumTitle, artistTitle]
  )

  return (
    <Breadcrumb className="min-w-0 flex-1">
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1

          return (
            <Fragment key={`${crumb.label}-${index}`}>
              {index > 0 ? <BreadcrumbSeparator /> : null}
              <BreadcrumbItem>
                {isLast || !crumb.href ? (
                  <BreadcrumbPage className="max-w-[min(100%,14rem)] truncate sm:max-w-md">
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
