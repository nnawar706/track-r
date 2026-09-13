import db from '../db/connection.js';

export function findAll() {
  return db
    .prepare(
      `SELECT project.*,
              COALESCE(SUM(CASE WHEN time_entry.billable = 1 THEN time_entry.hours END), 0) AS total_billable_hours
       FROM project
       LEFT JOIN time_entry ON time_entry.project_id = project.id
       GROUP BY project.id
       ORDER BY project.id ASC`
    )
    .all();
}

export function findById(id) {
  return db.prepare('SELECT * FROM project WHERE id = ?').get(id);
}

export function create({ name, clientName }) {
  const { lastInsertRowid } = db
    .prepare('INSERT INTO project (name, client_name) VALUES (?, ?)')
    .run(name, clientName);

  return findById(lastInsertRowid);
}
