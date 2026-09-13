import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import type { TimesheetDetail } from "@/types"

type TimesheetDetailModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  detail: TimesheetDetail | null
}

export function TimesheetDetailModal({ open, onOpenChange, detail }: TimesheetDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {detail ? `Week of ${formatWeekRange(detail.weekStart, detail.weekEnd)}` : "Timesheet Detail"}
          </DialogTitle>
        </DialogHeader>

        {detail && (
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
                <p className="font-medium text-foreground">{detail.updatedAt}</p>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
