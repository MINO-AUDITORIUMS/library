"use client"

import { Fragment, useMemo } from "react"
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
import { getMockAlbumById } from "@/lib/catalog/mock-albums"
import { routes } from "@/lib/routes"

type Crumb = {
  label: string
  href?: string
}

function buildCrumbs(pathname: string): Crumb[] {
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
  if (albumMatch) {
    const id = albumMatch[1]
    const album = getMockAlbumById(id)
    return [
      { label: "Accueil", href: routes.app },
      { label: "Bibliothèque", href: routes.bibliotheque },
      { label: album?.title ?? "Album" },
    ]
  }

  return [{ label: "Accueil", href: routes.app }]
}

export function AppBreadcrumb() {
  const pathname = usePathname()
  const crumbs = useMemo(() => buildCrumbs(pathname), [pathname])

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
