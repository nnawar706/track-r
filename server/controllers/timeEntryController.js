import { z } from 'zod';
import * as timeEntryModel from '../models/timeEntryModel.js';
import * as timesheetModel from '../models/timesheetModel.js';
import * as projectModel from '../models/projectModel.js';
import { getWeekStart } from '../lib/week.js';

const createEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
  projectId: z.number().int().positive(),
  hours: z.number().gt(0).lt(20),
  billable: z.boolean().optional().default(true),
  note: z.string().trim().nullable().optional(),
});

export function createEntry(req, res) {
  const parsed = createEntrySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Please check the entry details and try again.' });
  }

  const { date, projectId, hours, billable, note } = parsed.data;

  try {
    const project = projectModel.findById(projectId);
    if (!project) {
      return res.status(400).json({ message: 'Selected project does not exist.' });
    }

    const weekStart = getWeekStart(date);
    const timesheet = timesheetModel.getOrCreate(weekStart);

    if (timesheet.status === 'submitted') {
      return res.status(403).json({ message: 'You cannot add an entry to a submitted timesheet.' });
    }

    const entry = timeEntryModel.create({
      timesheetId: timesheet.id,
      projectId,
      date,
      hours,
      billable,
      note: note ?? null,
    });

    return res.status(201).json({
      id: entry.id,
      projectId: entry.project_id,
      projectName: project.name,
      date: entry.date,
      hours: entry.hours,
      billable: Boolean(entry.billable),
      note: entry.note,
      weekStart: timesheet.week_start,
    });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ message: 'An entry for this project and date already exists.' });
    }
    console.error('[timeEntryController.createEntry]', error);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}
