import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SummaryCards } from "@/components/SummaryCards"
import { EntryList } from "@/components/EntryList"
import { TimesheetHistoryList } from "@/components/TimesheetHistoryList"
import { TimesheetDetailModal } from "@/components/TimesheetDetailModal"
import { formatWeekRange } from "@/lib/formatWeekRange"
import { getWeekStart } from "@/lib/week"
import { weekEnd, weekStart } from "@/lib/currentWeek"
import { ApiError } from "@/api/client"
import { deleteEntry } from "@/api/entries"
import { getTimesheetByWeekStart, listTimesheets, submitTimesheet } from "@/api/timesheets"
import type { TimeEntry, Timesheet, TimesheetDetail, TimesheetStatus } from "@/types"

type EntryMutation = {
  date: string
  token: number
}

type HomeProps = {
  projectsCount: number
  projectsLoading: boolean
  entryMutation: EntryMutation | null
  onEditEntry: (entry: TimeEntry) => void
  onError: (message: string) => void
}

export function Home({ projectsCount, projectsLoading, entryMutation, onEditEntry, onError }: HomeProps) {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [status, setStatus] = useState<TimesheetStatus>("draft")
  const [entriesLoading, setEntriesLoading] = useState(true)
  const [entriesError, setEntriesError] = useState<string | null>(null)

  const [timesheets, setTimesheets] = useState<Timesheet[]>([])
  const [timesheetsLoading, setTimesheetsLoading] = useState(true)

  const [selectedWeekStart, setSelectedWeekStart] = useState<string | null>(null)
  const [selectedDetail, setSelectedDetail] = useState<TimesheetDetail | null>(null)
  const [selectedDetailLoading, setSelectedDetailLoading] = useState(false)
  const [selectedDetailError, setSelectedDetailError] = useState<string | null>(null)

  const [submittingWeekStart, setSubmittingWeekStart] = useState<string | null>(null)
  const [isDeletingEntry, setIsDeletingEntry] = useState(false)

  const loadWeekData = useCallback(async () => {
    setEntriesLoading(true)
    setEntriesError(null)
    try {
      const data = await getTimesheetByWeekStart(weekStart)
      setEntries(data.entries)
      setStatus(data.status)
    } catch (error) {
      console.error("[Home] failed to load week data", error)
      setEntriesError(
        error instanceof ApiError ? error.message : "Unable to load this week's data. Please try again."
      )
    } finally {
      setEntriesLoading(false)
    }
  }, [])

  useEffect(() => {
    loadWeekData()
  }, [loadWeekData])

  const loadTimesheets = useCallback(async () => {
    try {
      const data = await listTimesheets()
      setTimesheets(data)
    } catch (error) {
      console.error("[Home] failed to load timesheet history", error)
    } finally {
      setTimesheetsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTimesheets()
  }, [loadTimesheets])

  const fetchSelectedDetail = useCallback(
    async (targetWeekStart: string) => {
      setSelectedDetailLoading(true)
      setSelectedDetailError(null)
      try {
        const data = await getTimesheetByWeekStart(targetWeekStart)
        const row = timesheets.find((t) => t.weekStart === targetWeekStart)
        setSelectedDetail({
          id: row?.id ?? 0,
          weekStart: data.weekStart,
          weekEnd: data.weekEnd,
          status: data.status,
          submittedAt: data.submittedAt,
          entryCount: data.entries.length,
          totalBillableHours: data.billableHours,
          updatedAt: data.updatedAt,
          entries: data.entries,
        })
      } catch (error) {
        console.error("[Home] failed to load timesheet detail", error)
        setSelectedDetailError(
          error instanceof ApiError ? error.message : "Unable to load this timesheet. Please try again."
        )
      } finally {
        setSelectedDetailLoading(false)
      }
    },
    [timesheets]
  )

  // Entries are created/edited via NewEntryModal, which lives in App.tsx (Navbar's "New Entry"
  // button can open it from any page). entryMutation is how App tells this page something changed.
  useEffect(() => {
    if (!entryMutation) return
    const mutatedWeekStart = getWeekStart(entryMutation.date)
    loadTimesheets()
    if (mutatedWeekStart === weekStart) {
      loadWeekData()
    }
    if (selectedWeekStart && mutatedWeekStart === selectedWeekStart) {
      fetchSelectedDetail(selectedWeekStart)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryMutation])

  function handleSelectTimesheet(timesheet: Timesheet) {
    setSelectedWeekStart(timesheet.weekStart)
    setSelectedDetail(null)
    fetchSelectedDetail(timesheet.weekStart)
  }

  function handleCloseDetail(open: boolean) {
    if (open) return
    setSelectedWeekStart(null)
    setSelectedDetail(null)
    setSelectedDetailError(null)
  }

  async function handleDeleteEntry(entryId: number, entryDate: string) {
    setIsDeletingEntry(true)
    try {
      await deleteEntry(entryId)
    } catch (error) {
      console.error("[Home] failed to delete entry", error)
      onError(error instanceof ApiError ? error.message : "Unable to delete entry. Please try again.")
      setIsDeletingEntry(false)
      return
    }

    const entryWeekStart = getWeekStart(entryDate)
    const refreshes: Promise<unknown>[] = [loadTimesheets()]
    if (entryWeekStart === weekStart) {
      refreshes.push(loadWeekData())
    }
    if (selectedWeekStart && entryWeekStart === selectedWeekStart) {
      refreshes.push(fetchSelectedDetail(selectedWeekStart))
    }
    await Promise.all(refreshes)
    setIsDeletingEntry(false)
  }

  async function handleSubmitWeek(targetWeekStart: string) {
    if (submittingWeekStart !== null) return
    setSubmittingWeekStart(targetWeekStart)
    try {
      await submitTimesheet(targetWeekStart)
      const refreshes: Promise<unknown>[] = [loadTimesheets()]
      if (targetWeekStart === weekStart) {
        refreshes.push(loadWeekData())
      }
      if (selectedWeekStart && targetWeekStart === selectedWeekStart) {
        refreshes.push(fetchSelectedDetail(selectedWeekStart))
      }
      await Promise.all(refreshes)
    } catch (error) {
      console.error("[Home] failed to submit timesheet", error)
      onError(error instanceof ApiError ? error.message : "Unable to submit timesheet. Please try again.")
    } finally {
      setSubmittingWeekStart(null)
    }
  }

  function handleSubmit() {
    if (entries.length === 0 || status === "submitted") return
    handleSubmitWeek(weekStart)
  }

  function handleSubmitHistoryRow(timesheet: Timesheet) {
    if (timesheet.status === "submitted" || timesheet.entryCount === 0) return
    handleSubmitWeek(timesheet.weekStart)
  }

  const billableHours = entries
    .filter((entry) => entry.billable)
    .reduce((sum, entry) => sum + entry.hours, 0)

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
            <Button variant="outline" onClick={loadWeekData}>
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
          isSubmitting={submittingWeekStart === weekStart}
          isDeleting={isDeletingEntry}
          onEdit={onEditEntry}
          onDelete={handleDeleteEntry}
          onSubmit={handleSubmit}
        />
      )}

      <TimesheetHistoryList
        timesheets={timesheets}
        isLoading={timesheetsLoading}
        submittingWeekStart={submittingWeekStart}
        onRowClick={handleSelectTimesheet}
        onSubmit={handleSubmitHistoryRow}
      />

      <TimesheetDetailModal
        open={selectedWeekStart !== null}
        onOpenChange={handleCloseDetail}
        detail={selectedDetail}
        isLoading={selectedDetailLoading}
        error={selectedDetailError}
        isDeleting={isDeletingEntry}
        onEdit={onEditEntry}
        onDelete={handleDeleteEntry}
      />
    </main>
  )
}
