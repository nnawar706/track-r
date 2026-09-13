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

export function findLastUpdatedAt(timesheetId) {
  const row = db
    .prepare('SELECT MAX(updated_at) AS last_updated FROM time_entry WHERE timesheet_id = ?')
    .get(timesheetId);
  return row.last_updated;
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

export function update(id, { projectId, hours, billable, note }) {
  db.prepare(
    `UPDATE time_entry SET project_id = ?, hours = ?, billable = ?, note = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).run(projectId, hours, billable ? 1 : 0, note, id);

  return findById(id);
}

export function remove(id) {
  db.prepare('DELETE FROM time_entry WHERE id = ?').run(id);
}
