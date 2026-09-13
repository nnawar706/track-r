import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { addDays } from "@/lib/week"
import type { TimeEntry, TimesheetStatus } from "@/types"

type EntryListProps = {
  weekStart: string
  status: TimesheetStatus
  entries: TimeEntry[]
  onEdit: (entry: TimeEntry) => void
  onDelete: (entryId: number) => void
  onSubmit: () => void
}

const WEEKDAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

function formatDayLabel(dateStr: string, weekdayIndex: number): string {
  const [, month, day] = dateStr.split("-").map(Number)
  return `${WEEKDAY_LABELS[weekdayIndex]}, ${month}/${day}`
}

export function EntryList({ weekStart, status, entries, onEdit, onDelete, onSubmit }: EntryListProps) {
  const days = useMemo(
    () => Array.from({ length: 5 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  )

  const isSubmitted = status === "submitted"
  const isEmpty = entries.length === 0
  const weekTotalHours = entries.reduce((sum, entry) => sum + entry.hours, 0)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>This Week's Entries</CardTitle>
        <span className="text-sm text-muted-foreground">{weekTotalHours.toFixed(1)}h total</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border py-12 text-center">
            <p className="text-sm font-medium text-foreground">No entries yet this week</p>
            <p className="text-sm text-muted-foreground">Log your first entry to get started.</p>
          </div>
        ) : (
          days.map((day, index) => {
            const dayEntries = entries.filter((entry) => entry.date === day)
            if (dayEntries.length === 0) return null
            const dayTotal = dayEntries.reduce((sum, entry) => sum + entry.hours, 0)

            return (
              <div key={day}>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">
                    {formatDayLabel(day, index)}
                  </h3>
                  <span className="text-sm text-muted-foreground">{dayTotal.toFixed(1)}h</span>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Billable</TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dayEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.projectName}</TableCell>
                        <TableCell>{entry.hours.toFixed(1)}</TableCell>
                        <TableCell>{entry.billable ? "Billable" : "Non-billable"}</TableCell>
                        <TableCell className="text-muted-foreground">{entry.note ?? "—"}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isSubmitted}
                            onClick={() => onEdit(entry)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isSubmitted}
                            onClick={() => onDelete(entry.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )
          })
        )}

        <div className="flex justify-end border-t border-border pt-4">
          <Button onClick={onSubmit} disabled={isSubmitted || isEmpty}>
            {isSubmitted ? "Submitted" : "Submit Timesheet"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
