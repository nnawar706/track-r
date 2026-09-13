import db from '../db/connection.js';

export function findAll() {
  return db.prepare('SELECT * FROM project ORDER BY id ASC').all();
}

export function findById(id) {
  return db.prepare('SELECT * FROM project WHERE id = ?').get(id);
}
