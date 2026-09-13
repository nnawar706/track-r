import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  onRowClick: (timesheet: Timesheet) => void
}

export function TimesheetHistoryList({ timesheets, onRowClick }: TimesheetHistoryListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Timesheet History</CardTitle>
      </CardHeader>
      <CardContent>
        {timesheets.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No timesheets yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Week</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Entries</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timesheets.map((timesheet) => (
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
