"use client"

import { useEffect, useMemo, useState } from "react"

export type LocationType = {
  id: string
  label: string
}

const STORAGE_KEY = "mino.locationTypes.v1"

const defaultLocationTypes: LocationType[] = [
  { id: "mino-venue", label: "Salle MINO" },
  { id: "cinema", label: "Cinéma" },
  { id: "outdoor", label: "Plein air" },
  { id: "other", label: "Autre" },
]

function safeParseTypes(raw: string | null): LocationType[] | null {
  if (!raw) return null
  try {
    const v = JSON.parse(raw) as unknown
    if (!Array.isArray(v)) return null
    const items = v
      .map((x) => {
        const obj = x as Partial<LocationType>
        if (!obj?.id || !obj?.label) return null
        return { id: String(obj.id), label: String(obj.label) }
      })
      .filter((x): x is LocationType => x != null)
    return items.length ? items : null
  } catch {
    return null
  }
}

function persist(types: LocationType[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(types))
}

function loadInitial(): LocationType[] {
  if (typeof window === "undefined") return defaultLocationTypes
  const parsed = safeParseTypes(window.localStorage.getItem(STORAGE_KEY))
  if (parsed) return parsed
  persist(defaultLocationTypes)
  return defaultLocationTypes
}

function normalizeId(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function useLocationTypes() {
  const [types, setTypes] = useState<LocationType[]>(() => loadInitial())

  useEffect(() => {
    persist(types)
  }, [types])

  const typeById = useMemo(() => {
    return Object.fromEntries(types.map((t) => [t.id, t])) as Record<
      string,
      LocationType
    >
  }, [types])

  const addType = (label: string) => {
    const trimmed = label.trim()
    if (!trimmed) return null
    const id = normalizeId(trimmed)
    if (!id) return null
    setTypes((prev) => {
      if (prev.some((t) => t.id === id)) return prev
      return [...prev, { id, label: trimmed }]
    })
    return id
  }

  const removeType = (id: string) => {
    setTypes((prev) => prev.filter((t) => t.id !== id))
  }

  const updateTypeLabel = (id: string, label: string) => {
    const trimmed = label.trim()
    if (!trimmed) return
    setTypes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, label: trimmed } : t)),
    )
  }

  return { types, typeById, addType, removeType, updateTypeLabel }
}

