import * as timesheetModel from '../models/timesheetModel.js';
import * as timeEntryModel from '../models/timeEntryModel.js';
import { getWeekEnd } from '../lib/week.js';

const WEEK_START_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function getByWeekStart(req, res) {
  const { weekStart } = req.params;

  if (!WEEK_START_REGEX.test(weekStart)) {
    return res.status(400).json({ message: 'Invalid week.' });
  }

  try {
    const timesheet = timesheetModel.findByWeekStart(weekStart);

    if (!timesheet) {
      return res.status(200).json({
        weekStart,
        weekEnd: getWeekEnd(weekStart),
        status: 'draft',
        submittedAt: null,
        entries: [],
        billableHours: 0,
      });
    }

    const entries = timeEntryModel.findByTimesheet(timesheet.id);
    const billableHours = entries
      .filter((entry) => entry.billable)
      .reduce((sum, entry) => sum + entry.hours, 0);

    return res.status(200).json({
      weekStart: timesheet.week_start,
      weekEnd: timesheet.week_end,
      status: timesheet.status,
      submittedAt: timesheet.submitted_at,
      entries: entries.map((entry) => ({
        id: entry.id,
        projectId: entry.project_id,
        projectName: entry.project_name,
        date: entry.date,
        hours: entry.hours,
        billable: Boolean(entry.billable),
        note: entry.note,
      })),
      billableHours,
    });
  } catch (error) {
    console.error('[timesheetController.getByWeekStart]', error);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}

export function submitTimesheet(req, res) {
  const { weekStart } = req.params;

  if (!WEEK_START_REGEX.test(weekStart)) {
    return res.status(400).json({ message: 'Invalid week.' });
  }

  try {
    const timesheet = timesheetModel.findByWeekStart(weekStart);
    const entryCount = timesheet ? timeEntryModel.findByTimesheet(timesheet.id).length : 0;

    if (entryCount === 0) {
      return res.status(400).json({ message: 'You cannot submit a timesheet with no entries.' });
    }

    if (timesheet.status === 'submitted') {
      return res.status(409).json({ message: 'This timesheet has already been submitted.' });
    }

    const updated = timesheetModel.markSubmitted(weekStart);

    return res.status(200).json({
      status: updated.status,
      submittedAt: updated.submitted_at,
    });
  } catch (error) {
    console.error('[timesheetController.submitTimesheet]', error);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}
