import { ArrowRightIcon, CalendarDaysIcon } from "lucide-react"
import Link from "next/link"

import { SessionPreviewCard } from "@/components/programmation/session-preview-card"
import { Button } from "@/components/ui/button"
import type { ProgrammationSession } from "@/lib/programmation/types"
import { routes } from "@/lib/routes"

export type HomeUpcomingSessionsProps = {
  sessions: ProgrammationSession[]
}

export function HomeUpcomingSessions({ sessions }: HomeUpcomingSessionsProps) {
  if (sessions.length === 0) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Prochaines programmations
        </h2>
        <div className="rounded-xl border border-dashed px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Aucune séance à venir. Programme un album depuis la bibliothèque ou
            la page programmation.
          </p>
          <Button asChild className="mt-4">
            <Link href={routes.programmation}>
              <CalendarDaysIcon />
              Ouvrir la programmation
              <ArrowRightIcon />
            </Link>
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Prochaines programmations
          </h2>
          <p className="text-sm text-muted-foreground">
            Les prochaines séances planifiées.
          </p>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href={routes.programmation}>
            Tout voir
            <ArrowRightIcon />
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {sessions.map((session) => (
          <SessionPreviewCard key={session.id} session={session} />
        ))}
      </div>
    </section>
  )
}
