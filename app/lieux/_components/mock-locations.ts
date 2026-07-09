export type LocationRoom = {
  id: string
  name: string
  capacity?: number
}

export type Location = {
  id: string
  name: string
  kind: "mino-venue" | "cinema" | "outdoor" | "other"
  address: string
  city: string
  position: { longitude: number; latitude: number }
  rooms: LocationRoom[]
}

export const mockLocations: Location[] = [
  {
    id: "location-1",
    name: "Le Grand Rex — Studio",
    kind: "cinema",
    address: "1 Bd Poissonnière",
    city: "Paris",
    position: { longitude: 2.3499, latitude: 48.8706 },
    rooms: [
      { id: "room-1", name: "Studio", capacity: 180 },
      { id: "room-2", name: "Salle 2", capacity: 120 },
    ],
  },
  {
    id: "location-2",
    name: "La Bellevilloise",
    kind: "other",
    address: "19-21 Rue Boyer",
    city: "Paris",
    position: { longitude: 2.3859, latitude: 48.8684 },
    rooms: [{ id: "room-3", name: "Grande salle", capacity: 300 }],
  },
  {
    id: "location-3",
    name: "Cinéma Utopia",
    kind: "cinema",
    address: "5 Pl Camille Jullian",
    city: "Bordeaux",
    position: { longitude: -0.5743, latitude: 44.8387 },
    rooms: [
      { id: "room-4", name: "Salle 1", capacity: 110 },
      { id: "room-5", name: "Salle 2", capacity: 90 },
      { id: "room-6", name: "Salle 3", capacity: 70 },
    ],
  },
  {
    id: "location-4",
    name: "Plein air — Parc",
    kind: "outdoor",
    address: "Parc (entrée principale)",
    city: "Lyon",
    position: { longitude: 4.8357, latitude: 45.764 },
    rooms: [{ id: "room-7", name: "Espace scène", capacity: 800 }],
  },
]

