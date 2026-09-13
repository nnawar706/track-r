import db from '../db/connection.js';

export function findById(id) {
  return db.prepare('SELECT * FROM time_entry WHERE id = ?').get(id);
}

export function findByTimesheet(timesheetId) {
  return db
    .prepare(
      `SELECT time_entry.id, time_entry.project_id, project.name AS project_name,
              time_entry.date, time_entry.hours, time_entry.billable, time_entry.note
       FROM time_entry
       JOIN project ON project.id = time_entry.project_id
       WHERE time_entry.timesheet_id = ?
       ORDER BY time_entry.date ASC, time_entry.id ASC`
    )
    .all(timesheetId);
}

export function create({ timesheetId, projectId, date, hours, billable, note }) {
  const { lastInsertRowid } = db
    .prepare(
      `INSERT INTO time_entry (timesheet_id, project_id, date, hours, billable, note)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(timesheetId, projectId, date, hours, billable ? 1 : 0, note);

  return findById(lastInsertRowid);
}
