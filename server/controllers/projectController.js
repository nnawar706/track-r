import * as projectModel from '../models/projectModel.js';

export function listProjects(req, res) {
  try {
    const projects = projectModel.findAll().map((project) => ({
      id: project.id,
      name: project.name,
      clientName: project.client_name,
    }));

    return res.status(200).json(projects);
  } catch (error) {
    console.error('[projectController.listProjects]', error);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}
