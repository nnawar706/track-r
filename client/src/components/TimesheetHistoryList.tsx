import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import type { Timesheet } from "@/types"

type TimesheetHistoryListProps = {
  timesheets: Timesheet[]
  isLoading: boolean
  submittingWeekStart: string | null
  onRowClick: (timesheet: Timesheet) => void
  onSubmit: (timesheet: Timesheet) => void
}

export function TimesheetHistoryList({
  timesheets,
  isLoading,
  submittingWeekStart,
  onRowClick,
  onSubmit,
}: TimesheetHistoryListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Timesheet History</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : timesheets.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No timesheets yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Week</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Entries</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timesheets.map((timesheet) => {
                const isDraft = timesheet.status !== "submitted"
                const isSubmitting = submittingWeekStart === timesheet.weekStart

                return (
                  <TableRow
                    key={timesheet.id}
                    className="cursor-pointer"
                    onClick={() => onRowClick(timesheet)}
                  >
                    <TableCell>{formatWeekRange(timesheet.weekStart, timesheet.weekEnd)}</TableCell>
                    <TableCell>
                      <StatusBadge status={timesheet.status} />
                    </TableCell>
                    <TableCell className="text-right">{timesheet.entryCount}</TableCell>
                    <TableCell className="text-right">
                      {isDraft && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={timesheet.entryCount === 0 || submittingWeekStart !== null}
                          onClick={(e) => {
                            e.stopPropagation()
                            onSubmit(timesheet)
                          }}
                        >
                          {isSubmitting ? "Submitting..." : "Submit"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
