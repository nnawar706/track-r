import db from '../db/connection.js';
import { getWeekEnd } from '../lib/week.js';

export function findByWeekStart(weekStart) {
  return db.prepare('SELECT * FROM timesheet WHERE week_start = ?').get(weekStart);
}

export function getOrCreate(weekStart) {
  const existing = findByWeekStart(weekStart);
  if (existing) return existing;

  const weekEnd = getWeekEnd(weekStart);
  const { lastInsertRowid } = db
    .prepare('INSERT INTO timesheet (week_start, week_end) VALUES (?, ?)')
    .run(weekStart, weekEnd);

  return db.prepare('SELECT * FROM timesheet WHERE id = ?').get(lastInsertRowid);
}

export function markSubmitted(weekStart) {
  db.prepare(
    `UPDATE timesheet SET status = 'submitted', submitted_at = datetime('now') WHERE week_start = ?`
  ).run(weekStart);

  return findByWeekStart(weekStart);
}
