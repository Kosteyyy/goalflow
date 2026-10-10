import { Router } from 'express';
import { asyncHandler } from '../middleware/error';
import { parseBody } from '../utils/http';
import { CreateTaskSchema, UpdateTaskSchema, TaskStatus } from '../schemas';
import {
  listTasks,
  getTaskView,
  createTask,
  updateTask,
  deleteTask,
} from '../services/tasks.service';

export const tasksRouter = Router();

tasksRouter.get('/', (req, res) => {
  const projectIdParam = req.query.projectId;
  const projectId =
    projectIdParam === 'null' ? null :
    typeof projectIdParam === 'string' ? projectIdParam : undefined;

  const statusRaw = req.query.status;
  const status =
    typeof statusRaw === 'string' && TaskStatus.safeParse(statusRaw).success
      ? (statusRaw as ReturnType<typeof TaskStatus.parse>)
      : undefined;

  const tag = typeof req.query.tag === 'string' ? req.query.tag : undefined;

  res.json(listTasks({ projectId, status, tag }));
});

tasksRouter.get('/:id', (req, res) => {
  res.json(getTaskView(req.params.id));
});

tasksRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = parseBody(CreateTaskSchema, req.body);
    const task = await createTask(body);
    res.status(201).json(task);
  }),
);

tasksRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const body = parseBody(UpdateTaskSchema, req.body);
    const task = await updateTask(req.params.id, body);
    res.json(task);
  }),
);

tasksRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await deleteTask(req.params.id);
    res.status(204).end();
  }),
);
