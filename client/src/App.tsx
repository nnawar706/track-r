import { useCallback, useEffect, useState } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Navbar } from "@/components/Navbar"
import { NewEntryModal } from "@/components/NewEntryModal"
import { Toast } from "@/components/Toast"
import { Home } from "@/pages/Home"
import { Projects } from "@/pages/Projects"
import { addDays, getWeekEnd, getWeekStart } from "@/lib/week"
import { formatWeekRange } from "@/lib/formatWeekRange"
import { ApiError } from "@/api/client"
import { createEntry } from "@/api/entries"
import { listProjects } from "@/api/projects"
import { getTimesheetByWeekStart, submitTimesheet } from "@/api/timesheets"
import type { Project, TimeEntry, Timesheet, TimesheetDetail, TimesheetStatus } from "@/types"

const weekStart = getWeekStart(new Date())
const weekEnd = getWeekEnd(weekStart)

const previousWeekStart = addDays(weekStart, -7)
const previousWeekEnd = getWeekEnd(previousWeekStart)
const twoWeeksAgoStart = addDays(weekStart, -14)
const twoWeeksAgoEnd = getWeekEnd(twoWeeksAgoStart)

const MOCK_TIMESHEETS: Timesheet[] = [
  {
    id: 101,
    weekStart: previousWeekStart,
    weekEnd: previousWeekEnd,
    status: "submitted",
    submittedAt: `${previousWeekEnd}T17:00:00Z`,
    entryCount: 3,
  },
  {
    id: 102,
    weekStart: twoWeeksAgoStart,
    weekEnd: twoWeeksAgoEnd,
    status: "submitted",
    submittedAt: `${twoWeeksAgoEnd}T16:30:00Z`,
    entryCount: 5,
  },
]

const MOCK_TIMESHEET_DETAILS: Record<number, TimesheetDetail> = {
  101: {
    id: 101,
    weekStart: previousWeekStart,
    weekEnd: previousWeekEnd,
    status: "submitted",
    submittedAt: `${previousWeekEnd}T17:00:00Z`,
    entryCount: 3,
    totalBillableHours: 12.5,
    updatedAt: previousWeekEnd,
    entries: [
      {
        id: 201,
        projectId: 1,
        projectName: "Website Redesign",
        date: previousWeekStart,
        hours: 5,
        billable: true,
        note: "Sprint planning + setup",
      },
      {
        id: 202,
        projectId: 2,
        projectName: "Mobile App",
        date: addDays(previousWeekStart, 1),
        hours: 4,
        billable: true,
        note: null,
      },
      {
        id: 203,
        projectId: 1,
        projectName: "Website Redesign",
        date: addDays(previousWeekStart, 2),
        hours: 3.5,
        billable: true,
        note: "QA pass",
      },
    ],
  },
  102: {
    id: 102,
    weekStart: twoWeeksAgoStart,
    weekEnd: twoWeeksAgoEnd,
    status: "submitted",
    submittedAt: `${twoWeeksAgoEnd}T16:30:00Z`,
    entryCount: 5,
    totalBillableHours: 18,
    updatedAt: twoWeeksAgoEnd,
    entries: [
      {
        id: 204,
        projectId: 3,
        projectName: "Data Migration",
        date: twoWeeksAgoStart,
        hours: 4,
        billable: true,
        note: "Schema audit",
      },
      {
        id: 205,
        projectId: 1,
        projectName: "Website Redesign",
        date: addDays(twoWeeksAgoStart, 1),
        hours: 4,
        billable: true,
        note: null,
      },
      {
        id: 206,
        projectId: 2,
        projectName: "Mobile App",
        date: addDays(twoWeeksAgoStart, 2),
        hours: 5,
        billable: true,
        note: "Beta build fixes",
      },
      {
        id: 207,
        projectId: 2,
        projectName: "Mobile App",
        date: addDays(twoWeeksAgoStart, 3),
        hours: 3,
        billable: true,
        note: null,
      },
      {
        id: 208,
        projectId: 3,
        projectName: "Data Migration",
        date: addDays(twoWeeksAgoStart, 4),
        hours: 2,
        billable: false,
        note: "Cleanup",
      },
    ],
  },
}

export function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)

  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [status, setStatus] = useState<TimesheetStatus>("draft")
  const [entriesLoading, setEntriesLoading] = useState(true)
  const [entriesError, setEntriesError] = useState<string | null>(null)

  const [lastUsedProjectId, setLastUsedProjectId] = useState<number | null>(null)
  const [newEntryOpen, setNewEntryOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const [toast, setToast] = useState<{ message: string; variant: "info" | "error" } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  async function handleSaveEntry(input: {
    id?: number
    projectId: number
    date: string
    hours: number
    billable: boolean
    note: string | null
  }): Promise<void> {
    if (input.id !== undefined) {
      const project = projects.find((p) => p.id === input.projectId)
      if (!project) return

      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === input.id
            ? {
                ...entry,
                projectId: input.projectId,
                projectName: project.name,
                hours: input.hours,
                billable: input.billable,
                note: input.note,
              }
            : entry
        )
      )
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

    if (created.weekStart === weekStart) {
      await loadWeekData()
      return
    }

    setToast({
      message: `Added to week of ${formatWeekRange(created.weekStart, getWeekEnd(created.weekStart))}`,
      variant: "info",
    })
  }

  function handleDeleteEntry(entryId: number) {
    setEntries((prev) => prev.filter((entry) => entry.id !== entryId))
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
      await loadWeekData()
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
              onRetryEntries={loadWeekData}
              timesheets={MOCK_TIMESHEETS}
              timesheetDetails={MOCK_TIMESHEET_DETAILS}
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
