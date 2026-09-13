import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/StatusBadge"
import { formatWeekRange } from "@/lib/formatWeekRange"
import { formatDateTime } from "@/lib/formatDateTime"
import type { TimeEntry, TimesheetDetail } from "@/types"

type TimesheetDetailModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  detail: TimesheetDetail | null
  isLoading: boolean
  error: string | null
  isDeleting: boolean
  onEdit: (entry: TimeEntry) => void
  onDelete: (entryId: number, entryDate: string) => void
}

export function TimesheetDetailModal({
  open,
  onOpenChange,
  detail,
  isLoading,
  error,
  isDeleting,
  onEdit,
  onDelete,
}: TimesheetDetailModalProps) {
  const isEditable = detail !== null && detail.status !== "submitted"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {detail ? `Week of ${formatWeekRange(detail.weekStart, detail.weekEnd)}` : "Timesheet Detail"}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{error}</p>
        ) : (
          detail && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <StatusBadge status={detail.status} />
                </div>
                <div>
                  <p className="text-muted-foreground">Billable Hours</p>
                  <p className="font-medium text-foreground">{detail.totalBillableHours.toFixed(1)}h</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Updated</p>
                  <p className="font-medium text-foreground">
                    {detail.updatedAt ? formatDateTime(detail.updatedAt) : "—"}
                  </p>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Billable</TableHead>
                    <TableHead>Note</TableHead>
                    {isEditable && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail.entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell>{entry.projectName}</TableCell>
                      <TableCell>{entry.hours.toFixed(1)}</TableCell>
                      <TableCell>{entry.billable ? "Billable" : "Non-billable"}</TableCell>
                      <TableCell className="text-muted-foreground">{entry.note ?? "—"}</TableCell>
                      {isEditable && (
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => onEdit(entry)}>
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isDeleting}
                            onClick={() => onDelete(entry.id, entry.date)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )
        )}
      </DialogContent>
    </Dialog>
  )
}
