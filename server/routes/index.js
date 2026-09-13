import express from 'express';
import timeEntryRoutes from './timeEntryRoutes.js';
import projectRoutes from './projectRoutes.js';
import timesheetRoutes from './timesheetRoutes.js';

const router = express.Router();

router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
})

router.use('/entries', timeEntryRoutes);
router.use('/projects', projectRoutes);
router.use('/timesheets', timesheetRoutes);

export default router;