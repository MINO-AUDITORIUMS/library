"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

import type {
  Location,
  LocationCreateInput,
  LocationType,
  LocationUpdateInput,
} from "@/lib/locations/types"

async function readApiError(response: Response) {
  try {
    const body = (await response.json()) as { error?: string }
    return body.error ?? "Une erreur est survenue."
  } catch {
    return "Une erreur est survenue."
  }
}

export type UseLocationsOptions = {
  initialLocations: Location[]
  initialTypes: LocationType[]
}

export function useLocations({
  initialLocations,
  initialTypes,
}: UseLocationsOptions) {
  const [locations, setLocations] = useState(initialLocations)
  const [types, setTypes] = useState(initialTypes)
  const capacityTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  )

  useEffect(() => {
    const timers = capacityTimers.current
    return () => {
      for (const timer of timers.values()) clearTimeout(timer)
      timers.clear()
    }
  }, [])

  const typeById = useMemo(() => {
    return Object.fromEntries(types.map((t) => [t.id, t])) as Record<
      string,
      LocationType
    >
  }, [types])

  const usageCountByTypeId = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const location of locations) {
      counts[location.typeId] = (counts[location.typeId] ?? 0) + 1
    }
    return counts
  }, [locations])

  const createLocation = useCallback(async (input: LocationCreateInput) => {
    const response = await fetch("/api/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })

    if (!response.ok) throw new Error(await readApiError(response))

    const body = (await response.json()) as { location: Location }
    setLocations((current) => [body.location, ...current])
    return body.location
  }, [])

  const updateLocation = useCallback(
    async (locationId: string, patch: LocationUpdateInput) => {
      const response = await fetch(`/api/locations/${locationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })

      if (!response.ok) throw new Error(await readApiError(response))

      const body = (await response.json()) as { location: Location }
      setLocations((current) =>
        current.map((location) =>
          location.id === locationId ? body.location : location
        )
      )
      return body.location
    },
    []
  )

  const deleteLocation = useCallback(async (locationId: string) => {
    const previous = locations
    setLocations((current) => current.filter((l) => l.id !== locationId))

    const response = await fetch(`/api/locations/${locationId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      setLocations(previous)
      throw new Error(await readApiError(response))
    }
  }, [locations])

  const addRoom = useCallback(async (locationId: string) => {
    const response = await fetch(`/api/locations/${locationId}/rooms`, {
      method: "POST",
    })

    if (!response.ok) throw new Error(await readApiError(response))

    const body = (await response.json()) as {
      room: Location["rooms"][number]
    }

    setLocations((current) =>
      current.map((location) => {
        if (location.id !== locationId) return location
        return { ...location, rooms: [...location.rooms, body.room] }
      })
    )

    return body.room
  }, [])

  const removeRoom = useCallback(
    async (locationId: string, roomId: string) => {
      const previous = locations
      setLocations((current) =>
        current.map((location) => {
          if (location.id !== locationId) return location
          return {
            ...location,
            rooms: location.rooms.filter((room) => room.id !== roomId),
          }
        })
      )

      const response = await fetch(
        `/api/locations/${locationId}/rooms/${roomId}`,
        { method: "DELETE" }
      )

      if (!response.ok) {
        setLocations(previous)
        throw new Error(await readApiError(response))
      }
    },
    [locations]
  )

  const updateRoomCapacity = useCallback(
    (locationId: string, roomId: string, capacity: number | null) => {
      setLocations((current) =>
        current.map((location) => {
          if (location.id !== locationId) return location
          return {
            ...location,
            rooms: location.rooms.map((room) =>
              room.id === roomId ? { ...room, capacity } : room
            ),
          }
        })
      )

      const key = `${locationId}:${roomId}`
      const existing = capacityTimers.current.get(key)
      if (existing) clearTimeout(existing)

      const timer = setTimeout(async () => {
        capacityTimers.current.delete(key)
        try {
          const response = await fetch(
            `/api/locations/${locationId}/rooms/${roomId}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ capacity }),
            }
          )
          if (!response.ok) throw new Error(await readApiError(response))
          const body = (await response.json()) as {
            room: Location["rooms"][number]
          }
          setLocations((current) =>
            current.map((location) => {
              if (location.id !== locationId) return location
              return {
                ...location,
                rooms: location.rooms.map((room) =>
                  room.id === roomId ? body.room : room
                ),
              }
            })
          )
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Impossible d’enregistrer la capacité."
          )
        }
      }, 400)

      capacityTimers.current.set(key, timer)
    },
    []
  )

  const addType = useCallback(async (label: string) => {
    const response = await fetch("/api/location-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    })

    if (!response.ok) throw new Error(await readApiError(response))

    const body = (await response.json()) as { type: LocationType }
    setTypes((current) => {
      if (current.some((t) => t.id === body.type.id)) return current
      return [...current, body.type]
    })
    return body.type.id
  }, [])

  const removeType = useCallback(async (typeId: string) => {
    const previous = types
    setTypes((current) => current.filter((t) => t.id !== typeId))

    const response = await fetch(`/api/location-types/${typeId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      setTypes(previous)
      throw new Error(await readApiError(response))
    }
  }, [types])

  const updateTypeLabel = useCallback(async (typeId: string, label: string) => {
    const response = await fetch(`/api/location-types/${typeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    })

    if (!response.ok) throw new Error(await readApiError(response))

    const body = (await response.json()) as { type: LocationType }
    setTypes((current) =>
      current.map((type) => (type.id === typeId ? body.type : type))
    )
    setLocations((current) =>
      current.map((location) =>
        location.typeId === typeId
          ? {
              ...location,
              typeLabel: body.type.label,
              typeCode: body.type.code,
            }
          : location
      )
    )
  }, [])

  return {
    locations,
    types,
    typeById,
    usageCountByTypeId,
    createLocation,
    updateLocation,
    deleteLocation,
    addRoom,
    removeRoom,
    updateRoomCapacity,
    addType,
    removeType,
    updateTypeLabel,
  }
}
