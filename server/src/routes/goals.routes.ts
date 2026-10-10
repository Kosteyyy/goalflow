import { Router } from 'express';
import { asyncHandler } from '../middleware/error';
import { parseBody } from '../utils/http';
import { CreateGoalSchema, UpdateGoalSchema } from '../schemas';
import {
  listGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} from '../services/goals.service';

export const goalsRouter = Router();

goalsRouter.get('/', (_req, res) => {
  res.json(listGoals());
});

goalsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const body = parseBody(CreateGoalSchema, req.body);
    const goal = await createGoal(body);
    res.status(201).json(goal);
  }),
);

goalsRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const body = parseBody(UpdateGoalSchema, req.body);
    const goal = await updateGoal(req.params.id, body);
    res.json(goal);
  }),
);

goalsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await deleteGoal(req.params.id);
    res.status(204).end();
  }),
);
