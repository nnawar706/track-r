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
