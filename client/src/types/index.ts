export type Project = {
  id: number
  name: string
  clientName: string
  totalBillableHours: number
}

export type TimeEntry = {
  id: number
  projectId: number
  projectName: string
  date: string
  hours: number
  billable: boolean
  note: string | null
}

export type TimesheetStatus = "draft" | "submitted"

export type Timesheet = {
  id: number
  weekStart: string
  weekEnd: string
  status: TimesheetStatus
  submittedAt: string | null
  entryCount: number
}

export type TimesheetDetail = Timesheet & {
  totalBillableHours: number
  updatedAt: string | null
  entries: TimeEntry[]
}
