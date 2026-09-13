import { z } from 'zod';
import * as projectModel from '../models/projectModel.js';

const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'Project name is required'),
  clientName: z.string().trim().min(1, 'Client name is required'),
});

export function listProjects(req, res) {
  try {
    const projects = projectModel.findAll().map((project) => ({
      id: project.id,
      name: project.name,
      clientName: project.client_name,
      totalBillableHours: project.total_billable_hours,
    }));

    return res.status(200).json(projects);
  } catch (error) {
    console.error('[projectController.listProjects]', error);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}

export function createProject(req, res) {
  const parsed = createProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Please provide a project name and client name.' });
  }

  try {
    const project = projectModel.create(parsed.data);

    return res.status(201).json({
      id: project.id,
      name: project.name,
      clientName: project.client_name,
      totalBillableHours: 0,
    });
  } catch (error) {
    console.error('[projectController.createProject]', error);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}
