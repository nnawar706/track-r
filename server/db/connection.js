import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { seed } from './seed.js';

const dbPath = process.env.DB_PATH || path.join(import.meta.dirname, 'app.db');
const schemaPath = path.join(import.meta.dirname, 'schema.sql');

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');
db.exec(fs.readFileSync(schemaPath, 'utf8'));
seed(db);

export default db;
