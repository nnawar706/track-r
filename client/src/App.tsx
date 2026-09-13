import { useCallback, useEffect, useState } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Navbar } from "@/components/Navbar"
import { NewEntryModal } from "@/components/NewEntryModal"
import { Toast } from "@/components/Toast"
import { Home } from "@/pages/Home"
import { Projects } from "@/pages/Projects"
import { getWeekEnd, getWeekStart } from "@/lib/week"
import { formatWeekRange } from "@/lib/formatWeekRange"
import { ApiError } from "@/api/client"
import { createEntry, deleteEntry, updateEntry } from "@/api/entries"
import { listProjects } from "@/api/projects"
import { getTimesheetByWeekStart, listTimesheets, submitTimesheet } from "@/api/timesheets"
import type { Project, TimeEntry, Timesheet, TimesheetDetail, TimesheetStatus } from "@/types"

const weekStart = getWeekStart(new Date())
const weekEnd = getWeekEnd(weekStart)

export function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)

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

  const [lastUsedProjectId, setLastUsedProjectId] = useState<number | null>(null)
  const [newEntryOpen, setNewEntryOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const [toast, setToast] = useState<{ message: string; variant: "info" | "error" } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeletingEntry, setIsDeletingEntry] = useState(false)

  useEffect(() => {
    let cancelled = false

    listProjects()
      .then((data) => {
        if (!cancelled) setProjects(data)
      })
      .catch((error: unknown) => {
        console.error("[App] failed to load projects", error)
      })
      .finally(() => {
        if (!cancelled) setProjectsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const loadWeekData = useCallback(async () => {
    setEntriesLoading(true)
    setEntriesError(null)
    try {
      const data = await getTimesheetByWeekStart(weekStart)
      setEntries(data.entries)
      setStatus(data.status)
    } catch (error) {
      console.error("[App] failed to load week data", error)
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
      console.error("[App] failed to load timesheet history", error)
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
        console.error("[App] failed to load timesheet detail", error)
        setSelectedDetailError(
          error instanceof ApiError ? error.message : "Unable to load this timesheet. Please try again."
        )
      } finally {
        setSelectedDetailLoading(false)
      }
    },
    [timesheets]
  )

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

  async function handleSaveEntry(input: {
    id?: number
    projectId: number
    date: string
    hours: number
    billable: boolean
    note: string | null
  }): Promise<void> {
    if (input.id !== undefined) {
      await updateEntry(input.id, {
        projectId: input.projectId,
        hours: input.hours,
        billable: input.billable,
        note: input.note,
      })

      const entryWeekStart = getWeekStart(input.date)
      if (entryWeekStart === weekStart) {
        await loadWeekData()
      }
      if (selectedWeekStart && entryWeekStart === selectedWeekStart) {
        await fetchSelectedDetail(selectedWeekStart)
      }
      return
    }

    const created = await createEntry({
      projectId: input.projectId,
      date: input.date,
      hours: input.hours,
      billable: input.billable,
      note: input.note,
    })

    setLastUsedProjectId(created.projectId)
    await loadTimesheets()

    if (created.weekStart === weekStart) {
      await loadWeekData()
      return
    }

    setToast({
      message: `Added to week of ${formatWeekRange(created.weekStart, getWeekEnd(created.weekStart))}`,
      variant: "info",
    })
  }

  async function handleDeleteEntry(entryId: number, entryDate: string) {
    setIsDeletingEntry(true)
    try {
      await deleteEntry(entryId)
    } catch (error) {
      console.error("[App] failed to delete entry", error)
      setToast({
        message: error instanceof ApiError ? error.message : "Unable to delete entry. Please try again.",
        variant: "error",
      })
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

  function handleEditEntry(entry: TimeEntry) {
    setEditingEntry(entry)
    setNewEntryOpen(true)
  }

  async function handleSubmit() {
    if (entries.length === 0 || status === "submitted" || isSubmitting) return
    setIsSubmitting(true)
    try {
      await submitTimesheet(weekStart)
      await Promise.all([loadWeekData(), loadTimesheets()])
    } catch (error) {
      console.error("[App] failed to submit timesheet", error)
      setToast({
        message: error instanceof ApiError ? error.message : "Unable to submit timesheet. Please try again.",
        variant: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <BrowserRouter>
      <Navbar
        onNewEntryClick={() => {
          setEditingEntry(null)
          setNewEntryOpen(true)
        }}
      />
      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={() => setToast(null)} />}
      <Routes>
        <Route
          path="/"
          element={
            <Home
              projectsCount={projects.length}
              projectsLoading={projectsLoading}
              weekStart={weekStart}
              weekEnd={weekEnd}
              status={status}
              entries={entries}
              entriesLoading={entriesLoading}
              entriesError={entriesError}
              isSubmitting={isSubmitting}
              isDeletingEntry={isDeletingEntry}
              onRetryEntries={loadWeekData}
              timesheets={timesheets}
              timesheetsLoading={timesheetsLoading}
              selectedDetail={selectedDetail}
              selectedDetailOpen={selectedWeekStart !== null}
              selectedDetailLoading={selectedDetailLoading}
              selectedDetailError={selectedDetailError}
              onSelectTimesheet={handleSelectTimesheet}
              onCloseDetail={handleCloseDetail}
              onEditEntry={handleEditEntry}
              onDeleteEntry={handleDeleteEntry}
              onSubmit={handleSubmit}
            />
          }
        />
        <Route path="/projects" element={<Projects />} />
      </Routes>
      <NewEntryModal
        open={newEntryOpen}
        onOpenChange={(open) => {
          setNewEntryOpen(open)
          if (!open) setEditingEntry(null)
        }}
        projects={projects}
        lastUsedProjectId={lastUsedProjectId}
        editingEntry={editingEntry}
        onSave={handleSaveEntry}
      />
    </BrowserRouter>
  )
}
