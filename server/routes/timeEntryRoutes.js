import express from 'express';
import { createEntry, updateEntry, deleteEntry } from '../controllers/timeEntryController.js';

const router = express.Router();

router.post('/', createEntry);
router.put('/:id', updateEntry);
router.delete('/:id', deleteEntry);

export default router;
