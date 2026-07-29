import type { SupabaseClient } from "@supabase/supabase-js"

import {
  roundMoney,
  ticketPriceHt,
} from "@/lib/format/money"
import type {
  ProjectTicketLine,
  TicketLineCreateInput,
  TicketLineUpdateInput,
} from "@/lib/projects/finance-types"

type LocationEmbed = {
  id: string
  name: string
  city: string
}

type TicketLineRow = {
  id: string
  location_id: string
  capacity_per_screening: number
  screenings: number
  invitations: number
  tickets_sold: number
  ticket_price_ttc: number | string
  vat_rate: number | string
  is_free: boolean
  sort_order: number
  locations: LocationEmbed | LocationEmbed[] | null
}

const ticketSelect = `
  id,
  location_id,
  capacity_per_screening,
  screenings,
  invitations,
  tickets_sold,
  ticket_price_ttc,
  vat_rate,
  is_free,
  sort_order,
  locations!location_id (
    id,
    name,
    city
  )
`

function readEmbed<T>(value: T | T[] | null): T | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

function toAmount(value: number | string) {
  return roundMoney(typeof value === "number" ? value : Number(value))
}

export function mapTicketLine(row: TicketLineRow): ProjectTicketLine {
  const location = readEmbed(row.locations)
  const capacityPerScreening = row.capacity_per_screening
  const screenings = row.screenings
  const invitations = row.invitations
  const ticketsSold = row.tickets_sold
  const ticketPriceTtc = row.is_free ? 0 : toAmount(row.ticket_price_ttc)
  const vatRate = toAmount(row.vat_rate)
  const totalCapacity = capacityPerScreening * screenings
  const ticketsOnSale = Math.max(totalCapacity - invitations, 0)
  const priceHt = row.is_free ? 0 : ticketPriceHt(ticketPriceTtc, vatRate)
  const potentialRevenueHt = roundMoney(ticketsOnSale * priceHt)
  const actualRevenueHt = roundMoney(ticketsSold * priceHt)
  const fillRate =
    ticketsOnSale > 0 ? roundMoney((ticketsSold / ticketsOnSale) * 100) : 0

  return {
    id: row.id,
    locationId: location?.id ?? row.location_id,
    locationName: location?.name ?? "Lieu inconnu",
    locationCity: location?.city ?? "",
    capacityPerScreening,
    screenings,
    invitations,
    ticketsSold,
    ticketPriceTtc,
    vatRate,
    isFree: row.is_free,
    sortOrder: row.sort_order,
    totalCapacity,
    ticketsOnSale,
    ticketPriceHt: roundMoney(priceHt),
    potentialRevenueHt,
    actualRevenueHt,
    fillRate,
  }
}

export async function listProjectTicketLines(
  supabase: SupabaseClient,
  projectId: string
): Promise<ProjectTicketLine[]> {
  const { data, error } = await supabase
    .from("project_ticket_lines")
    .select(ticketSelect)
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true })

  if (error) throw error
  return ((data ?? []) as unknown as TicketLineRow[]).map(mapTicketLine)
}

export async function createTicketLine(
  supabase: SupabaseClient,
  projectId: string,
  input: TicketLineCreateInput
): Promise<ProjectTicketLine> {
  const { data: maxRow } = await supabase
    .from("project_ticket_lines")
    .select("sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle()

  const sortOrder =
    typeof maxRow?.sort_order === "number" ? maxRow.sort_order + 10 : 0

  const isFree = input.isFree ?? false

  const { data, error } = await supabase
    .from("project_ticket_lines")
    .insert({
      project_id: projectId,
      location_id: input.locationId,
      capacity_per_screening: input.capacityPerScreening ?? 0,
      screenings: input.screenings ?? 1,
      invitations: input.invitations ?? 0,
      tickets_sold: input.ticketsSold ?? 0,
      ticket_price_ttc: isFree ? 0 : (input.ticketPriceTtc ?? 0),
      vat_rate: input.vatRate ?? 5.5,
      is_free: isFree,
      sort_order: sortOrder,
    })
    .select(ticketSelect)
    .single()

  if (error) throw error
  return mapTicketLine(data as unknown as TicketLineRow)
}

export async function updateTicketLine(
  supabase: SupabaseClient,
  lineId: string,
  input: TicketLineUpdateInput
): Promise<ProjectTicketLine> {
  const patch: Record<string, unknown> = {}

  if (input.locationId !== undefined) patch.location_id = input.locationId
  if (input.capacityPerScreening !== undefined) {
    patch.capacity_per_screening = input.capacityPerScreening
  }
  if (input.screenings !== undefined) patch.screenings = input.screenings
  if (input.invitations !== undefined) patch.invitations = input.invitations
  if (input.ticketsSold !== undefined) patch.tickets_sold = input.ticketsSold
  if (input.vatRate !== undefined) patch.vat_rate = input.vatRate
  if (input.isFree !== undefined) {
    patch.is_free = input.isFree
    if (input.isFree) patch.ticket_price_ttc = 0
  }
  if (input.ticketPriceTtc !== undefined && input.isFree !== true) {
    patch.ticket_price_ttc = input.ticketPriceTtc
  }

  const { data, error } = await supabase
    .from("project_ticket_lines")
    .update(patch)
    .eq("id", lineId)
    .select(ticketSelect)
    .single()

  if (error) throw error
  return mapTicketLine(data as unknown as TicketLineRow)
}

export async function deleteTicketLine(
  supabase: SupabaseClient,
  lineId: string
) {
  const { error } = await supabase
    .from("project_ticket_lines")
    .delete()
    .eq("id", lineId)

  if (error) throw error
}
