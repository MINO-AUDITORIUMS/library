import type { AlbumDetail, AlbumSummary } from "@/lib/catalog/types"

const summaries: AlbumSummary[] = [
  {
    id: "1",
    title: "Kind of Blue",
    artist: "Miles Davis",
    releaseYear: 1959,
    label: "Columbia",
    format: "vinyl",
    rating: 5,
    tags: ["Incontournable", "Jazz"],
    genre: "Jazz",
    coverHue: 220,
    coverImageUrl: null,
  },
  {
    id: "2",
    title: "Random Access Memories",
    artist: "Daft Punk",
    releaseYear: 2013,
    label: "Columbia",
    format: "cd",
    rating: 4,
    tags: ["Coup de cœur"],
    genre: "Electronic",
    coverHue: 45,
    coverImageUrl: null,
  },
  {
    id: "3",
    title: "Blonde",
    artist: "Frank Ocean",
    releaseYear: 2016,
    label: "Boys Don't Cry",
    format: "vinyl",
    rating: 5,
    tags: ["Blockbuster"],
    genre: "R&B",
    coverHue: 280,
    coverImageUrl: null,
  },
  {
    id: "4",
    title: "Discovery",
    artist: "Daft Punk",
    releaseYear: 2001,
    label: "Virgin",
    format: "cd",
    rating: 4,
    tags: ["Electronic"],
    genre: "Electronic",
    coverHue: 200,
    coverImageUrl: null,
  },
  {
    id: "5",
    title: "Homework",
    artist: "Daft Punk",
    releaseYear: 1997,
    label: "Virgin",
    format: "vinyl",
    rating: 3,
    tags: [],
    genre: "House",
    coverHue: 30,
    coverImageUrl: null,
  },
  {
    id: "6",
    title: "In Rainbows",
    artist: "Radiohead",
    releaseYear: 2007,
    label: "XL Recordings",
    format: "digital",
    rating: 5,
    tags: ["Coup de cœur", "Indie"],
    genre: "Alternative",
    coverHue: 160,
    coverImageUrl: null,
  },
  {
    id: "7",
    title: "To Pimp a Butterfly",
    artist: "Kendrick Lamar",
    releaseYear: 2015,
    label: "Top Dawg Entertainment",
    format: "vinyl",
    rating: 5,
    tags: ["Incontournable"],
    genre: "Hip-Hop",
    coverHue: 15,
    coverImageUrl: null,
  },
  {
    id: "8",
    title: "Rumours",
    artist: "Fleetwood Mac",
    releaseYear: 1977,
    label: "Warner Bros.",
    format: "vinyl",
    rating: 4,
    tags: ["Classique"],
    genre: "Rock",
    coverHue: 340,
    coverImageUrl: null,
  },
  {
    id: "9",
    title: "Blue",
    artist: "Joni Mitchell",
    releaseYear: 1971,
    label: "Reprise Records",
    format: "vinyl",
    rating: 5,
    tags: ["Jazz tardif"],
    genre: "Folk",
    coverHue: 210,
    coverImageUrl: null,
  },
  {
    id: "10",
    title: "Currents",
    artist: "Tame Impala",
    releaseYear: 2015,
    label: "Modular",
    format: "cd",
    rating: 4,
    tags: [],
    genre: "Psychedelic",
    coverHue: 120,
    coverImageUrl: null,
  },
  {
    id: "11",
    title: "Illmatic",
    artist: "Nas",
    releaseYear: 1994,
    label: "Columbia",
    format: "cassette",
    rating: 5,
    tags: ["Hip-Hop"],
    genre: "Hip-Hop",
    coverHue: 25,
    coverImageUrl: null,
  },
  {
    id: "12",
    title: "Vespertine",
    artist: "Björk",
    releaseYear: 2001,
    label: "One Little Independent",
    format: "cd",
    rating: 4,
    tags: ["Experimental"],
    genre: "Electronic",
    coverHue: 190,
    coverImageUrl: null,
  },
]

const details: Record<string, Omit<AlbumDetail, keyof AlbumSummary>> = {
  "1": {
    releaseDate: "1959-08-17",
    subgenre: "Modal jazz",
    recordCompany: "Sony Music",
    producers: ["Teo Macero", "Irving Townsend"],
    country: "États-Unis",
    certification: "Platine",
    trackCount: 5,
    totalDurationSeconds: 2700,
    description:
      "Album studio de jazz modal enregistré en deux sessions à New York.",
    personalNotes: "Référence absolue pour la salle d'écoute.",
    tracks: [
      { position: 1, title: "So What", durationSeconds: 562 },
      { position: 2, title: "Freddie Freeloader", durationSeconds: 578 },
      { position: 3, title: "Blue in Green", durationSeconds: 337 },
      { position: 4, title: "All Blues", durationSeconds: 691 },
      { position: 5, title: "Flamenco Sketches", durationSeconds: 566 },
    ],
    officialClipsCount: 0,
    addedAt: "2026-03-10",
  },
}

function defaultDetail(
  summary: AlbumSummary
): Omit<AlbumDetail, keyof AlbumSummary> {
  return {
    releaseDate: `${summary.releaseYear}-01-01`,
    subgenre: summary.genre,
    recordCompany: summary.label,
    producers: ["—"],
    country: "France",
    certification: null,
    trackCount: 10,
    totalDurationSeconds: 2400,
    description: `Album ${summary.genre.toLowerCase()} — fiche de démonstration.`,
    personalNotes: "",
    tracks: Array.from({ length: 4 }, (_, i) => ({
      position: i + 1,
      title: `Piste ${i + 1}`,
      durationSeconds: 180 + i * 30,
    })),
    officialClipsCount: 2,
    addedAt: "2026-04-01",
  }
}

export function getMockAlbumSummaries() {
  return summaries
}

export function getMockAlbumById(id: string): AlbumDetail | null {
  const summary = summaries.find((a) => a.id === id)
  if (!summary) return null
  const extra = details[id] ?? defaultDetail(summary)
  return { ...summary, ...extra }
}

export function formatDuration(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function formatTrackDuration(seconds: number | null) {
  if (seconds == null) return "—"
  return formatDuration(seconds)
}
