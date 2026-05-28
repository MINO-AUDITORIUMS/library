const CERTIFICATION_PATTERNS = [
  /\b(?:certifi(?:é|e|ed)|certification)\s*(?:[:|-])?\s*(platine|or|diamant|gold|platinum|diamond|multi[\s-]?platine|multi[\s-]?platinum|double platine|double platinum)/i,
  /\b(s(?:\s|\.?)?n(?:\s|\.?)?e(?:\s|\.?)?p)\s*(?:[:|-])?\s*(platine|or|diamant|gold|platinum|diamond)/i,
  /\b(riaa)\s*(?:[:|-])?\s*(gold|platinum|multi[\s-]?platinum|diamond)/i,
  /\b(platine|or|diamant|gold|platinum|diamond|multi[\s-]?platine|multi[\s-]?platinum)\b/i,
]

const CERTIFICATION_LABELS: Record<string, string> = {
  platine: "Platine",
  or: "Or",
  diamant: "Diamant",
  gold: "Or",
  platinum: "Platine",
  diamond: "Diamant",
  "multi-platine": "Multi-platine",
  "multi-platinum": "Multi-platine",
  "multi platine": "Multi-platine",
  "multi platinum": "Multi-platine",
  "double platine": "Double platine",
  "double platinum": "Double platine",
}

function normalizeMatch(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ")
}

export function parseCertificationFromText(text: string) {
  const source = text.trim()
  if (!source) return ""

  for (const pattern of CERTIFICATION_PATTERNS) {
    const match = source.match(pattern)
    if (!match) continue
    const raw = normalizeMatch(match[1] ?? match[0])
    return CERTIFICATION_LABELS[raw] ?? match[1] ?? match[0]
  }

  return ""
}
