const eurFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
})

export function formatEur(amount: number) {
  return eurFormatter.format(amount)
}

export function ticketPriceHt(ttc: number, vatRate: number) {
  if (vatRate <= 0) return ttc
  return ttc / (1 + vatRate / 100)
}

export function roundMoney(amount: number) {
  return Math.round((amount + Number.EPSILON) * 100) / 100
}
