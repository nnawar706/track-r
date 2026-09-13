CREATE TABLE IF NOT EXISTS project (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  client_name   TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS timesheet (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  week_start    TEXT NOT NULL UNIQUE,     -- 'YYYY-MM-DD', always a Monday
  week_end      TEXT NOT NULL UNIQUE,     -- 'YYYY-MM-DD', always a Friday
  status        TEXT NOT NULL DEFAULT 'draft',  -- 'draft' | 'submitted'
  submitted_at  TEXT
);

CREATE TABLE IF NOT EXISTS time_entry (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  timesheet_id  INTEGER NOT NULL REFERENCES timesheet(id),
  project_id    INTEGER NOT NULL REFERENCES project(id),
  date          TEXT NOT NULL,             -- 'YYYY-MM-DD'
  hours         REAL NOT NULL,
  billable      INTEGER NOT NULL DEFAULT 1,
  note          TEXT,
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(project_id, date)
);
