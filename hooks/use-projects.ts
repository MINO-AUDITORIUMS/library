"use client"

import { useCallback, useState } from "react"

import type {
  Project,
  ProjectCreateInput,
  ProjectUpdateInput,
} from "@/lib/projects/types"

async function readApiError(response: Response) {
  try {
    const body = (await response.json()) as { error?: string }
    return body.error ?? "Une erreur est survenue."
  } catch {
    return "Une erreur est survenue."
  }
}

export type UseProjectsOptions = {
  initialProjects: Project[]
}

export function useProjects({ initialProjects }: UseProjectsOptions) {
  const [projects, setProjects] = useState(initialProjects)

  const createProject = useCallback(async (input: ProjectCreateInput) => {
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })

    if (!response.ok) throw new Error(await readApiError(response))

    const body = (await response.json()) as { project: Project }
    setProjects((current) => [body.project, ...current])
    return body.project
  }, [])

  const updateProject = useCallback(
    async (projectId: string, patch: ProjectUpdateInput) => {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })

      if (!response.ok) throw new Error(await readApiError(response))

      const body = (await response.json()) as { project: Project }
      setProjects((current) =>
        current.map((project) =>
          project.id === projectId ? body.project : project
        )
      )
      return body.project
    },
    []
  )

  const deleteProject = useCallback(
    async (projectId: string) => {
      const previous = projects
      setProjects((current) => current.filter((p) => p.id !== projectId))

      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        setProjects(previous)
        throw new Error(await readApiError(response))
      }
    },
    [projects]
  )

  return {
    projects,
    setProjects,
    createProject,
    updateProject,
    deleteProject,
  }
}
