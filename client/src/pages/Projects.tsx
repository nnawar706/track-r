import { useState } from "react"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProjectsTable } from "@/components/ProjectsTable"
import { AddProjectModal } from "@/components/AddProjectModal"
import type { Project } from "@/types"

type ProjectsProps = {
  projects: Project[]
  projectsLoading: boolean
  onCreateProject: (input: { name: string; clientName: string }) => Promise<void>
}

export function Projects({ projects, projectsLoading, onCreateProject }: ProjectsProps) {
  const [addProjectOpen, setAddProjectOpen] = useState(false)

  return (
    <main className="mx-auto flex w-full max-w-360 flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Projects</h1>
        <Button size="sm" onClick={() => setAddProjectOpen(true)}>
          <PlusIcon />
          Add Project
        </Button>
      </div>

      <ProjectsTable projects={projects} isLoading={projectsLoading} />

      <AddProjectModal open={addProjectOpen} onOpenChange={setAddProjectOpen} onSave={onCreateProject} />
    </main>
  )
}
