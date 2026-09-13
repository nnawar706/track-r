# Project Overview

## About

Track-r is a lightweight time-tracking and timesheet-submission tool for consultants at a small firm. It replaces ad-hoc capture (phone notes, a spreadsheet rebuilt weekly, hours reconstructed from memory) with a fast entry path for logging billable time as it happens, and a clear weekly view that a consultant can review and submit for approval.

---

## The Problem It Solves

Consultants currently capture time badly: notes scattered across devices, a spreadsheet rebuilt from scratch every week, and hours reconstructed from memory on Friday afternoon. This causes two failures: time gets lost (forgotten entries never get logged at all) and time gets distorted (reconstructed-from-memory hours are inaccurate).

Track-r addresses this with two things:
- A way to log a time entry the moment work happens.
- A weekly timesheet view that shows the week's entries and lets the consultant submit them.

---

# Pages / Routes

- '/': Default view. Shows 4 cards on top (total projects, total entries for this week, this timesheet/week's status, this week's/timesheet's billable hours). Below, it shows the day-grouped entries for the current week only, with the submit control. Also, a modal to create a new entry (only if status is not submitted). Also, it shows a timesheet history list of all timesheets (just week ranges + status + total entries. When clicked on a row, it opens a modal showing that sheet's start date - end date, Status, total billable hours, last updated at and a table with its time entries)
- '/projects': shows list of projects in a table with their total billable hours and a '+' button to add a new project.

No login screen, no user profile, no settings screen.

---

# Core User Flow

1. User opens the dashboard page ('/'). The four summary cards (total projects, entries logged this week, current week's status, current week's billable hours) give a glance on where things stand.
2. Below the cards, the current week's entries are shown day-grouped (editable depending on the timesheet's status). If it's a new week with no timesheet and nothing logged yet, this area shows an empty state instead of an empty table.
3. To log time, the user opens the 'new entry' modal. They pick a project, enter date (default to today's date, user can change the date), enter hours, toggle button to mark it non-billable (default to billable), add a note, and save. The modal closes and the entry appears immediately in the day-grouped list; the week's card totals update in place. 
2 validation checks for dates:
- When the date does not fall into any existing timesheets: create a new timesheet first and add entry into it.
- When the date falls into a timesheet that have been submitted: Show error that 'You cannot add an entry to a submitted timesheet.'
4. User can add new projects from '/projects' page
5. User reviews the timesheets directly on '/', submit it for approval. When submitted, that timesheet's entries become read-only. If not submitted, user can delete/edit that timesheet's entries. When editing an entry, user cannot edit the date.
6. To view a past week, the user scrolls to the timesheet history table on '/' and clicks a row. A modal opens showing that timesheet's date range, status, total billable hours, and it's full entry-list. 
7. '/projects' gives a view of all projects and each one's total billable hours logged against it.

---

# Data Architecture

The system uses a relational database: SQLite.

High-level entities: Project, Timesheet, TimeEntry. A timesheet is created the first time an entry is logged for a given week. There is no separate "start a new timesheet" step.

## Core entities

#### Project

- id
- name
- client_name
- created_at (datetime)

#### Timesheet

- id
- week_start (YYYY-MM-DD, always a Monday; unique)
- week_end (YYYY-MM-DD, always a Friday)
- status (Draft | Submitted)
- submitted_at (nullable)

One row per calendar week, created on first entry for that week.

#### TimeEntry

- id
- project_id (FK -> Project)
- timesheet_id (FK -> TimeSheet)
- date (YYYY-MM-DD)
- hours (decimal, >0, <20)
- billable (bool, default true)
- note (text, nullable)
- updated_at

Locking is enabled via the parent timesheet's status: an entry cannot be created, edited, or deleted once timesheet.status = 'submitted'. project_id and date combined should be unique. If a user tries to add an entry for a date that already exists for that project, show error.

---

# Features In Scope

- Log a time entry: date, project, decimal hours, billable flag, optional note
- Smart defaults on the entry form: today's date, select last used project
- Day-grouped entry list for the current week with daily and weekly running totals
- Edit / delete an entry, while its week is still in draft
- Weekly timesheet view showing status (Draft / Submitted)
- Submit action: locks the week (entries become read-only), flips status to Submitted, sets submitted_at

---

# Features Out of Scope

- Auth/multi-user accounts
- Approval workflow
- Live start/stop timer
- Un-submit request
- reporting, export, PDF generation

---

# Target User

Independent consultant or small firm employee who bills time to multiple clients.

---


# Success Criteria

- The complete core journey should work reliably:
1. Log a time entry against a project with valid hours
2. See it appear immediately in the dashboard's day-grouped list with correct running totals
3. Edit/delete entries while the timesheet is in draft
4. Submit the timesheet and see its status changed
5. Confirm the submitted week's entries are read-only
6. Week boundary logic is correct (cannot select Saturdays and Sundays, week is from Monday to Friday, a Sunday refers to that week's Monday not the following Monday).
7. Attempting to submit a week with zero entries is rejected.
8. Attempting to submit an already-submitted week is rejected.