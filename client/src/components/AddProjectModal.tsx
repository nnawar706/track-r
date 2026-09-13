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
import { ApiError } from "@/api/client"

type AddProjectModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (input: { name: string; clientName: string }) => Promise<void>
}

export function AddProjectModal({ open, onOpenChange, onSave }: AddProjectModalProps) {
  const [name, setName] = useState("")
  const [clientName, setClientName] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setName("")
    setClientName("")
    setSubmitError(null)
    setIsSaving(false)
  }, [open])

  const canSave = name.trim() !== "" && clientName.trim() !== "" && !isSaving

  async function handleSave() {
    if (!canSave) return
    setSubmitError(null)
    setIsSaving(true)
    try {
      await onSave({ name: name.trim(), clientName: clientName.trim() })
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
          <DialogTitle>Add Project</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              placeholder="e.g. Website Redesign"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="project-client">Client Name</Label>
            <Input
              id="project-client"
              placeholder="e.g. Acme Corp"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>
        </div>

        {submitError && <p className="text-sm text-destructive">{submitError}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            {isSaving ? "Saving..." : "Add Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
