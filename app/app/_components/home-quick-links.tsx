import Link from "next/link"
import { Disc3Icon, Mic2Icon, PlusIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { routes } from "@/lib/routes"
import { cn } from "@/lib/utils"

export type HomeQuickLinksProps = {
  albumCount: number
  artistCount: number
  className?: string
}

const links = [
  {
    href: routes.bibliotheque,
    title: "Bibliothèque",
    description: "Parcourir et filtrer les albums",
    icon: Disc3Icon,
    countKey: "albumCount" as const,
    unit: "album",
  },
  {
    href: routes.artistes,
    title: "Artistes",
    description: "Fiches et discographies MINO",
    icon: Mic2Icon,
    countKey: "artistCount" as const,
    unit: "artiste",
  },
  {
    href: routes.bibliothequeNew,
    title: "Nouvel album",
    description: "Importer depuis Discogs ou MusicBrainz",
    icon: PlusIcon,
    countKey: null,
    unit: null,
  },
] as const

function formatCount(count: number, unit: string) {
  const plural = count > 1 ? "s" : ""
  return `${count} ${unit}${plural}`
}

export function HomeQuickLinks({
  albumCount,
  artistCount,
  className,
}: HomeQuickLinksProps) {
  const counts = { albumCount, artistCount }

  return (
    <div className={cn("grid gap-4 sm:grid-cols-3", className)}>
      {links.map((link) => {
        const Icon = link.icon
        const count =
          link.countKey != null ? counts[link.countKey] : null

        return (
          <Link key={link.href} href={link.href} className="group block h-full">
            <Card className="h-full gap-3 py-4 transition-colors hover:bg-muted/30">
              <CardHeader className="px-4 pb-0">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </div>
                <CardTitle className="mt-3">{link.title}</CardTitle>
                <CardDescription>{link.description}</CardDescription>
              </CardHeader>
              {count != null && link.unit ? (
                <CardContent className="px-4 pt-0">
                  <p className="text-sm font-medium text-muted-foreground">
                    {formatCount(count, link.unit)}
                  </p>
                </CardContent>
              ) : (
                <CardContent className="px-4 pt-0">
                  <p className="text-sm font-medium text-primary group-hover:underline">
                    Commencer un import
                  </p>
                </CardContent>
              )}
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
