import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SummaryCards } from "@/components/SummaryCards"
import { EntryList } from "@/components/EntryList"
import { TimesheetHistoryList } from "@/components/TimesheetHistoryList"
import { TimesheetDetailModal } from "@/components/TimesheetDetailModal"
import { formatWeekRange } from "@/lib/formatWeekRange"
import type { TimeEntry, Timesheet, TimesheetDetail, TimesheetStatus } from "@/types"

type HomeProps = {
  projectsCount: number
  projectsLoading: boolean
  weekStart: string
  weekEnd: string
  status: TimesheetStatus
  entries: TimeEntry[]
  entriesLoading: boolean
  entriesError: string | null
  onRetryEntries: () => void
  timesheets: Timesheet[]
  timesheetDetails: Record<number, TimesheetDetail>
  onEditEntry: (entry: TimeEntry) => void
  onDeleteEntry: (entryId: number) => void
  onSubmit: () => void
}

export function Home({
  projectsCount,
  projectsLoading,
  weekStart,
  weekEnd,
  status,
  entries,
  entriesLoading,
  entriesError,
  onRetryEntries,
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
    <main className="mx-auto flex w-full max-w-360 flex-col gap-6 p-8">
      <h1 className="text-xl font-semibold text-foreground">
        Week of {formatWeekRange(weekStart, weekEnd)}
      </h1>

      <SummaryCards
        projectsCount={projectsCount}
        entriesThisWeek={entries.length}
        weekStatus={status}
        billableHoursThisWeek={billableHours}
        isLoading={projectsLoading || entriesLoading}
      />

      {entriesError ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm text-muted-foreground">{entriesError}</p>
            <Button variant="outline" onClick={onRetryEntries}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <EntryList
          weekStart={weekStart}
          status={status}
          entries={entries}
          isLoading={entriesLoading}
          onEdit={onEditEntry}
          onDelete={onDeleteEntry}
          onSubmit={onSubmit}
        />
      )}

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
