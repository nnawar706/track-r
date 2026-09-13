function parseDateOnly(date) {
  if (date instanceof Date) {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  }
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDateOnly(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getWeekStart(date) {
  const d = parseDateOnly(date);
  const dayOfWeek = d.getUTCDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  d.setUTCDate(d.getUTCDate() + diffToMonday);
  return formatDateOnly(d);
}

export function getWeekEnd(weekStart) {
  const d = parseDateOnly(weekStart);
  d.setUTCDate(d.getUTCDate() + 4);
  return formatDateOnly(d);
}
