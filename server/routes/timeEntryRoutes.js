import express from 'express';
import { createEntry } from '../controllers/timeEntryController.js';

const router = express.Router();

router.post('/', createEntry);

export default router;
