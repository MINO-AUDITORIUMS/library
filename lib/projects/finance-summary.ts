import { roundMoney } from "@/lib/format/money"
import type {
  ProjectBudget,
  ProjectFinanceSummary,
  ProjectTicketLine,
} from "@/lib/projects/finance-types"

export function computeProjectFinanceSummary(
  budget: ProjectBudget | null,
  ticketLines: ProjectTicketLine[]
): ProjectFinanceSummary {
  const budgetedTotal = budget?.budgetedTotal ?? 0
  const engagedTotal = budget?.engagedTotal ?? 0
  const remainingBudget = roundMoney(budgetedTotal - engagedTotal)
  const potentialTicketRevenue = roundMoney(
    ticketLines.reduce((sum, line) => sum + line.potentialRevenueHt, 0)
  )
  const actualTicketRevenue = roundMoney(
    ticketLines.reduce((sum, line) => sum + line.actualRevenueHt, 0)
  )
  const grossMargin = roundMoney(actualTicketRevenue - engagedTotal)

  return {
    budgetedTotal,
    engagedTotal,
    remainingBudget,
    potentialTicketRevenue,
    actualTicketRevenue,
    grossMargin,
  }
}
