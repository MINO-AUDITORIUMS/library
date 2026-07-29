import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ProjectDetailClient } from "@/app/projets/_components/project-detail-client"
import { listLocations } from "@/lib/locations/db/locations"
import { listBudgetCategories } from "@/lib/projects/db/budget-categories"
import { ensureProjectBudget } from "@/lib/projects/db/budgets"
import { listProjectStatuses } from "@/lib/projects/db/project-statuses"
import { listProjectTypes } from "@/lib/projects/db/project-types"
import { getProjectById } from "@/lib/projects/db/projects"
import { listProjectTicketLines } from "@/lib/projects/db/tickets"
import { requireAuthenticatedUser } from "@/lib/auth/require-authenticated-user"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Projet",
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { user } = await requireAuthenticatedUser()
  const supabase = await createClient()

  const project = await getProjectById(supabase, id)
  if (!project) notFound()

  const [types, statuses, locations, budget, ticketLines, budgetCategories] =
    await Promise.all([
      listProjectTypes(supabase),
      listProjectStatuses(supabase),
      listLocations(supabase),
      ensureProjectBudget(supabase, user, id),
      listProjectTicketLines(supabase, id),
      listBudgetCategories(supabase),
    ])

  return (
    <ProjectDetailClient
      initialProject={project}
      types={types}
      statuses={statuses}
      locations={locations.map((location) => ({
        id: location.id,
        name: location.name,
        city: location.city,
      }))}
      initialBudget={budget}
      initialTicketLines={ticketLines}
      budgetCategories={budgetCategories}
    />
  )
}
