import { apiRequest } from "@/api/client"
import type { TimeEntry } from "@/types"

type CreateEntryInput = {
  projectId: number
  date: string
  hours: number
  billable: boolean
  note: string | null
}

export type CreateEntryResponse = TimeEntry & { weekStart: string }

export function createEntry(input: CreateEntryInput): Promise<CreateEntryResponse> {
  return apiRequest<CreateEntryResponse>("/entries", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

type UpdateEntryInput = {
  projectId: number
  hours: number
  billable: boolean
  note: string | null
}

export function updateEntry(id: number, input: UpdateEntryInput): Promise<TimeEntry> {
  return apiRequest<TimeEntry>(`/entries/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  })
}

export async function deleteEntry(id: number): Promise<void> {
  await apiRequest<void>(`/entries/${id}`, { method: "DELETE" })
}
