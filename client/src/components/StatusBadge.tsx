import { Badge } from "@/components/ui/badge"
import type { TimesheetStatus } from "@/types"

type StatusBadgeProps = {
  status: TimesheetStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const isSubmitted = status === "submitted"

  return (
    <Badge
      variant="outline"
      className={
        isSubmitted
          ? "border-transparent bg-primary/10 text-primary"
          : "border-transparent bg-muted text-foreground"
      }
    >
      {isSubmitted ? "Submitted" : "Draft"}
    </Badge>
  )
}
