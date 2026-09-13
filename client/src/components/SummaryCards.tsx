import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge } from "@/components/StatusBadge"
import type { TimesheetStatus } from "@/types"

type SummaryCardsProps = {
  projectsCount: number
  entriesThisWeek: number
  weekStatus: TimesheetStatus
  billableHoursThisWeek: number
  isLoading: boolean
}

export function SummaryCards({
  projectsCount,
  entriesThisWeek,
  weekStatus,
  billableHoursThisWeek,
  isLoading,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-12" />
          ) : (
            <p className="text-2xl font-semibold text-foreground">{projectsCount}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Entries This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-12" />
          ) : (
            <p className="text-2xl font-semibold text-foreground">{entriesThisWeek}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Timesheet Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-5 w-16" /> : <StatusBadge status={weekStatus} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Billable Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="text-2xl font-semibold text-foreground">
              {billableHoursThisWeek.toFixed(1)}h
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
