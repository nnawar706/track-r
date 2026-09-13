const SYDNEY_TIME_ZONE = "Australia/Sydney"

export function formatDateTime(utcTimestamp: string): string {
  const date = new Date(`${utcTimestamp.replace(" ", "T")}Z`)
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: SYDNEY_TIME_ZONE,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}
