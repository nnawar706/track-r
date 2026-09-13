import express from 'express';
import { getByWeekStart, listTimesheets, submitTimesheet } from '../controllers/timesheetController.js';

const router = express.Router();

router.get('/', listTimesheets);
router.get('/:weekStart', getByWeekStart);
router.post('/:weekStart/submit', submitTimesheet);

export default router;
