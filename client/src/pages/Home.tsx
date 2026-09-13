import { useState } from "react"
import { SummaryCards } from "@/components/SummaryCards"
import { EntryList } from "@/components/EntryList"
import { TimesheetHistoryList } from "@/components/TimesheetHistoryList"
import { TimesheetDetailModal } from "@/components/TimesheetDetailModal"
import { formatWeekRange } from "@/lib/formatWeekRange"
import type { TimeEntry, Timesheet, TimesheetDetail, TimesheetStatus } from "@/types"

type HomeProps = {
  projectsCount: number
  weekStart: string
  weekEnd: string
  status: TimesheetStatus
  entries: TimeEntry[]
  timesheets: Timesheet[]
  timesheetDetails: Record<number, TimesheetDetail>
  onEditEntry: (entry: TimeEntry) => void
  onDeleteEntry: (entryId: number) => void
  onSubmit: () => void
}

export function Home({
  projectsCount,
  weekStart,
  weekEnd,
  status,
  entries,
  timesheets,
  timesheetDetails,
  onEditEntry,
  onDeleteEntry,
  onSubmit,
}: HomeProps) {
  const [selectedTimesheetId, setSelectedTimesheetId] = useState<number | null>(null)

  const billableHours = entries
    .filter((entry) => entry.billable)
    .reduce((sum, entry) => sum + entry.hours, 0)

  const selectedDetail =
    selectedTimesheetId !== null ? (timesheetDetails[selectedTimesheetId] ?? null) : null

  return (
    <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 p-8">
      <h1 className="text-xl font-semibold text-foreground">
        Week of {formatWeekRange(weekStart, weekEnd)}
      </h1>

      <SummaryCards
        projectsCount={projectsCount}
        entriesThisWeek={entries.length}
        weekStatus={status}
        billableHoursThisWeek={billableHours}
      />

      <EntryList
        weekStart={weekStart}
        status={status}
        entries={entries}
        onEdit={onEditEntry}
        onDelete={onDeleteEntry}
        onSubmit={onSubmit}
      />

      <TimesheetHistoryList
        timesheets={timesheets}
        onRowClick={(timesheet) => setSelectedTimesheetId(timesheet.id)}
      />

      <TimesheetDetailModal
        open={selectedTimesheetId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedTimesheetId(null)
        }}
        detail={selectedDetail}
      />
    </main>
  )
}
