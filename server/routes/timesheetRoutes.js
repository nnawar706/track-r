import express from 'express';
import { getByWeekStart } from '../controllers/timesheetController.js';

const router = express.Router();

router.get('/:weekStart', getByWeekStart);

export default router;
