import path from 'node:path';
import Database from 'better-sqlite3';

const dbPath = process.env.DB_PATH || path.join(import.meta.dirname, 'app.db');

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

export default db;
