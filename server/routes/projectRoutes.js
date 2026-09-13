import express from 'express';
import { listProjects } from '../controllers/projectController.js';

const router = express.Router();

router.get('/', listProjects);

export default router;
