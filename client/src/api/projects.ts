import { apiRequest } from "@/api/client"
import type { Project } from "@/types"

export function listProjects(): Promise<Project[]> {
  return apiRequest<Project[]>("/projects")
}

type CreateProjectInput = {
  name: string
  clientName: string
}

export function createProject(input: CreateProjectInput): Promise<Project> {
  return apiRequest<Project>("/projects", {
    method: "POST",
    body: JSON.stringify(input),
  })
}
