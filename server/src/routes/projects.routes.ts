import { Router } from 'express';
import { asyncHandler } from '../middleware/error';
import { parseBody } from '../utils/http';
import { CreateProjectSchema, UpdateProjectSchema } from '../schemas';
import {
  listProjects,
  createProject,
  updateProject,
  deleteProject,
} from '../services/projects.service';

export const projectsRouter = Router();

projectsRouter.get('/', (req, res) => {
  const goalId = typeof req.query.goalId === 'string' ? req.query.goalId : undefined;
  res.json(listProjects(goalId));
});

projectsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = parseBody(CreateProjectSchema, req.body);
    const project = await createProject(body);
    res.status(201).json(project);
  }),
);

projectsRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const body = parseBody(UpdateProjectSchema, req.body);
    const project = await updateProject(req.params.id, body);
    res.json(project);
  }),
);

projectsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await deleteProject(req.params.id);
    res.status(204).end();
  }),
);
