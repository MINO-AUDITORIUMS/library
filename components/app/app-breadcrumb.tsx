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

function buildCrumbs(pathname: string, albumTitle: string | null): Crumb[] {
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

  const albumId = useMemo(() => {
    const match = pathname.match(/^\/bibliotheque\/([^/]+)$/)
    if (!match || match[1] === "nouveau") return null
    return match[1]
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

  const crumbs = useMemo(
    () => buildCrumbs(pathname, albumTitle),
    [pathname, albumTitle]
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
