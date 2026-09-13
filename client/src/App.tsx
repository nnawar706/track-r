import { useCallback, useEffect, useState } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Navbar } from "@/components/Navbar"
import { NewEntryModal } from "@/components/NewEntryModal"
import { Toast } from "@/components/Toast"
import { Home } from "@/pages/Home"
import { Projects } from "@/pages/Projects"
import { getWeekEnd } from "@/lib/week"
import { weekStart } from "@/lib/currentWeek"
import { formatWeekRange } from "@/lib/formatWeekRange"
import { createEntry, updateEntry } from "@/api/entries"
import { createProject, listProjects } from "@/api/projects"
import type { Project, TimeEntry } from "@/types"

export function App() {
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)

  const [lastUsedProjectId, setLastUsedProjectId] = useState<number | null>(null)
  const [newEntryOpen, setNewEntryOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const [entryMutation, setEntryMutation] = useState<{ date: string; token: number } | null>(null)
  const [toast, setToast] = useState<{ message: string; variant: "info" | "error" } | null>(null)

  const loadProjects = useCallback(async () => {
    setProjectsLoading(true)
    try {
      const data = await listProjects()
      setProjects(data)
    } catch (error) {
      console.error("[App] failed to load projects", error)
    } finally {
      setProjectsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

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
      setEntryMutation({ date: input.date, token: Date.now() })
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
    setEntryMutation({ date: created.date, token: Date.now() })

    if (created.weekStart === weekStart) {
      return
    }

    setToast({
      message: `Added to week of ${formatWeekRange(created.weekStart, getWeekEnd(created.weekStart))}`,
      variant: "info",
    })
  }

  function handleEditEntry(entry: TimeEntry) {
    setEditingEntry(entry)
    setNewEntryOpen(true)
  }

  async function handleCreateProject(input: { name: string; clientName: string }): Promise<void> {
    await createProject(input)
    await loadProjects()
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
              entryMutation={entryMutation}
              onEditEntry={handleEditEntry}
              onError={(message) => setToast({ message, variant: "error" })}
            />
          }
        />
        <Route
          path="/projects"
          element={
            <Projects
              projects={projects}
              projectsLoading={projectsLoading}
              onCreateProject={handleCreateProject}
            />
          }
        />
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
