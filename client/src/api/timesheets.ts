import { apiRequest } from "@/api/client"
import type { TimeEntry, TimesheetStatus } from "@/types"

export type WeekTimesheet = {
  weekStart: string
  weekEnd: string
  status: TimesheetStatus
  submittedAt: string | null
  entries: TimeEntry[]
  billableHours: number
}

export function getTimesheetByWeekStart(weekStart: string): Promise<WeekTimesheet> {
  return apiRequest<WeekTimesheet>(`/timesheets/${weekStart}`)
}

type SubmitTimesheetResponse = {
  status: TimesheetStatus
  submittedAt: string
}

export function submitTimesheet(weekStart: string): Promise<SubmitTimesheetResponse> {
  return apiRequest<SubmitTimesheetResponse>(`/timesheets/${weekStart}/submit`, {
    method: "POST",
  })
}
