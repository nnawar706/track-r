import { apiRequest } from "@/api/client"
import type { Project } from "@/types"

export function listProjects(): Promise<Project[]> {
  return apiRequest<Project[]>("/projects")
}
