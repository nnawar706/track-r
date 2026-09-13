import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { isWeekend } from "@/lib/week"
import { ApiError } from "@/api/client"
import type { Project, TimeEntry } from "@/types"

type NewEntryModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  projects: Project[]
  lastUsedProjectId: number | null
  editingEntry: TimeEntry | null
  onSave: (input: {
    id?: number
    projectId: number
    date: string
    hours: number
    billable: boolean
    note: string | null
  }) => Promise<void>
}

function todayDateOnly(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function NewEntryModal({
  open,
  onOpenChange,
  projects,
  lastUsedProjectId,
  editingEntry,
  onSave,
}: NewEntryModalProps) {
  const [date, setDate] = useState(todayDateOnly())
  const [useLastProject, setUseLastProject] = useState(true)
  const [projectId, setProjectId] = useState<string>(
    lastUsedProjectId ? String(lastUsedProjectId) : ""
  )
  const [hours, setHours] = useState("")
  const [billable, setBillable] = useState(true)
  const [note, setNote] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!open) return

    setSubmitError(null)
    setIsSaving(false)

    if (editingEntry) {
      setDate(editingEntry.date)
      setProjectId(String(editingEntry.projectId))
      setHours(String(editingEntry.hours))
      setBillable(editingEntry.billable)
      setNote(editingEntry.note ?? "")
      setUseLastProject(false)
      return
    }

    setDate(todayDateOnly())
    setUseLastProject(lastUsedProjectId !== null)
    setProjectId(lastUsedProjectId ? String(lastUsedProjectId) : "")
    setHours("")
    setBillable(true)
    setNote("")
  }, [open, lastUsedProjectId, editingEntry])

  const dateIsWeekend = date !== "" && isWeekend(date)
  const parsedHours = Number(hours)
  const hoursValid = hours.trim() !== "" && parsedHours > 0 && parsedHours < 20
  const canSave = date !== "" && projectId !== "" && hoursValid && !dateIsWeekend && !isSaving

  async function handleSave() {
    if (!canSave) return
    setSubmitError(null)
    setIsSaving(true)
    try {
      await onSave({
        id: editingEntry?.id,
        projectId: Number(projectId),
        date,
        hours: parsedHours,
        billable,
        note: note.trim() === "" ? null : note.trim(),
      })
      onOpenChange(false)
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : "Something went wrong. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingEntry ? "Edit Entry" : "New Entry"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="entry-date">Date</Label>
            <Input
              id="entry-date"
              type="date"
              value={date}
              disabled={!!editingEntry}
              onChange={(e) => setDate(e.target.value)}
            />
            {dateIsWeekend && (
              <p className="text-sm text-destructive">Weekends can't be logged — pick a weekday.</p>
            )}
          </div>

          {!editingEntry && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="use-last-project"
                checked={useLastProject}
                disabled={lastUsedProjectId === null}
                onCheckedChange={(checked) => {
                  const isChecked = checked === true
                  setUseLastProject(isChecked)
                  if (isChecked && lastUsedProjectId !== null) {
                    setProjectId(String(lastUsedProjectId))
                  }
                }}
              />
              <Label htmlFor="use-last-project" className="font-normal">
                Use last used project
              </Label>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="entry-project">Project</Label>
            <Select
              value={projectId}
              disabled={!editingEntry && useLastProject}
              onValueChange={setProjectId}
            >
              <SelectTrigger id="entry-project" className="w-full">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={String(project.id)}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="entry-hours">Hours</Label>
            <Input
              id="entry-hours"
              type="number"
              min="0"
              max="20"
              step="0.25"
              placeholder="e.g. 2.5"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch id="entry-billable" checked={billable} onCheckedChange={setBillable} />
            <Label htmlFor="entry-billable" className="font-normal">
              Billable
            </Label>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="entry-note">Note</Label>
            <Textarea
              id="entry-note"
              placeholder="Optional note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        {submitError && <p className="text-sm text-destructive">{submitError}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            {isSaving ? "Saving..." : editingEntry ? "Save Changes" : "Save Entry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
