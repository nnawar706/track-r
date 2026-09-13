import { useState } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Navbar } from "@/components/Navbar"
import { NewEntryModal } from "@/components/NewEntryModal"
import { Home } from "@/pages/Home"
import { Projects } from "@/pages/Projects"
import { addDays, getWeekEnd, getWeekStart } from "@/lib/week"
import type { Project, TimeEntry, Timesheet, TimesheetDetail, TimesheetStatus } from "@/types"

const MOCK_PROJECTS: Project[] = [
  { id: 1, name: "Website Redesign", clientName: "Acme Corp" },
  { id: 2, name: "Mobile App", clientName: "Globex Inc" },
  { id: 3, name: "Data Migration", clientName: "Initech" },
]

const weekStart = getWeekStart(new Date())
const weekEnd = getWeekEnd(weekStart)

const INITIAL_ENTRIES: TimeEntry[] = [
  {
    id: 1,
    projectId: 1,
    projectName: "Website Redesign",
    date: weekStart,
    hours: 4,
    billable: true,
    note: "Homepage layout revisions",
  },
  {
    id: 2,
    projectId: 2,
    projectName: "Mobile App",
    date: weekStart,
    hours: 2.5,
    billable: true,
    note: null,
  },
  {
    id: 3,
    projectId: 1,
    projectName: "Website Redesign",
    date: addDays(weekStart, 1),
    hours: 6,
    billable: true,
    note: "Client review call + follow-up fixes",
  },
  {
    id: 4,
    projectId: 3,
    projectName: "Data Migration",
    date: addDays(weekStart, 2),
    hours: 3,
    billable: false,
    note: "Internal cleanup script",
  },
]

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
  const [entries, setEntries] = useState<TimeEntry[]>(INITIAL_ENTRIES)
  const [status, setStatus] = useState<TimesheetStatus>("draft")
  const [lastUsedProjectId, setLastUsedProjectId] = useState<number | null>(1)
  const [newEntryOpen, setNewEntryOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)

  function handleSaveEntry(input: {
    id?: number
    projectId: number
    date: string
    hours: number
    billable: boolean
    note: string | null
  }) {
    const project = MOCK_PROJECTS.find((p) => p.id === input.projectId)
    if (!project) return

    if (input.id !== undefined) {
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

    setEntries((prev) => [
      ...prev,
      {
        id: Date.now(),
        projectId: input.projectId,
        projectName: project.name,
        date: input.date,
        hours: input.hours,
        billable: input.billable,
        note: input.note,
      },
    ])
    setLastUsedProjectId(input.projectId)
  }

  function handleDeleteEntry(entryId: number) {
    setEntries((prev) => prev.filter((entry) => entry.id !== entryId))
  }

  function handleEditEntry(entry: TimeEntry) {
    setEditingEntry(entry)
    setNewEntryOpen(true)
  }

  function handleSubmit() {
    if (entries.length === 0 || status === "submitted") return
    setStatus("submitted")
  }

  return (
    <BrowserRouter>
      <Navbar
        onNewEntryClick={() => {
          setEditingEntry(null)
          setNewEntryOpen(true)
        }}
      />
      <Routes>
        <Route
          path="/"
          element={
            <Home
              projectsCount={MOCK_PROJECTS.length}
              weekStart={weekStart}
              weekEnd={weekEnd}
              status={status}
              entries={entries}
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
        projects={MOCK_PROJECTS}
        lastUsedProjectId={lastUsedProjectId}
        editingEntry={editingEntry}
        onSave={handleSaveEntry}
      />
    </BrowserRouter>
  )
}
