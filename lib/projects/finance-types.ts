export type BudgetCategory = {
  id: string
  code: string
  label: string
  sortOrder: number
  isActive: boolean
}

export type ProjectBudgetLine = {
  id: string
  categoryId: string
  categoryCode: string
  categoryLabel: string
  budgetedAmount: number
  engagedAmount: number
  sortOrder: number
  notes: string
}

export type ProjectBudget = {
  id: string
  projectId: string
  lines: ProjectBudgetLine[]
  budgetedTotal: number
  engagedTotal: number
  remainingTotal: number
}

export type ProjectTicketLine = {
  id: string
  locationId: string
  locationName: string
  locationCity: string
  capacityPerScreening: number
  screenings: number
  invitations: number
  ticketsSold: number
  ticketPriceTtc: number
  vatRate: number
  isFree: boolean
  sortOrder: number
  totalCapacity: number
  ticketsOnSale: number
  ticketPriceHt: number
  potentialRevenueHt: number
  actualRevenueHt: number
  fillRate: number
}

export type ProjectFinanceSummary = {
  budgetedTotal: number
  engagedTotal: number
  remainingBudget: number
  potentialTicketRevenue: number
  actualTicketRevenue: number
  grossMargin: number
}

export type BudgetLineCreateInput = {
  categoryId: string
  budgetedAmount?: number
  engagedAmount?: number
  notes?: string
}

export type BudgetLineUpdateInput = {
  budgetedAmount?: number
  engagedAmount?: number
  notes?: string
  categoryId?: string
}

export type TicketLineCreateInput = {
  locationId: string
  capacityPerScreening?: number
  screenings?: number
  invitations?: number
  ticketsSold?: number
  ticketPriceTtc?: number
  vatRate?: number
  isFree?: boolean
}

export type TicketLineUpdateInput = {
  locationId?: string
  capacityPerScreening?: number
  screenings?: number
  invitations?: number
  ticketsSold?: number
  ticketPriceTtc?: number
  vatRate?: number
  isFree?: boolean
}
