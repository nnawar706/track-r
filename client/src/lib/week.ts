function parseDateOnly(date: Date | string): Date {
  if (date instanceof Date) {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  }
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function formatDateOnly(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getWeekStart(date: Date | string): string {
  const d = parseDateOnly(date)
  const dayOfWeek = d.getUTCDay()
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  d.setUTCDate(d.getUTCDate() + diffToMonday)
  return formatDateOnly(d)
}

export function getWeekEnd(weekStart: string): string {
  const d = parseDateOnly(weekStart)
  d.setUTCDate(d.getUTCDate() + 4)
  return formatDateOnly(d)
}

export function isWeekend(date: Date | string): boolean {
  const dayOfWeek = parseDateOnly(date).getUTCDay()
  return dayOfWeek === 0 || dayOfWeek === 6
}

export function addDays(date: Date | string, days: number): string {
  const d = parseDateOnly(date)
  d.setUTCDate(d.getUTCDate() + days)
  return formatDateOnly(d)
}
