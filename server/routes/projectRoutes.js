import express from 'express';
import { listProjects, createProject } from '../controllers/projectController.js';

const router = express.Router();

router.get('/', listProjects);
router.post('/', createProject);

export default router;
