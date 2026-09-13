import { getWeekEnd, getWeekStart } from "@/lib/week"

export const weekStart = getWeekStart(new Date())
export const weekEnd = getWeekEnd(weekStart)
