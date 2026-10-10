import { Router } from 'express';
import { asyncHandler } from '../middleware/error';
import { parseBody } from '../utils/http';
import { ManualTimeSchema } from '../schemas';
import {
  startTimer,
  stopTimer,
  addManualTime,
  getTaskTime,
  getActive,
} from '../services/time.service';

export const timeRouter = Router();

// Активный таймер (глобальный)
timeRouter.get(
  '/timer/active',
  asyncHandler(async (_req, res) => {
    res.json(await getActive());
  }),
);

// Старт таймера на задаче
timeRouter.post(
  '/tasks/:id/timer/start',
  asyncHandler(async (req, res) => {
    const entry = await startTimer(req.params.id);
    res.status(201).json(entry);
  }),
);

// Стоп таймера на задаче
timeRouter.post(
  '/tasks/:id/timer/stop',
  asyncHandler(async (req, res) => {
    const entry = await stopTimer(req.params.id);
    res.json(entry);
  }),
);

// Ручной ввод времени
timeRouter.post(
  '/tasks/:id/time/manual',
  asyncHandler(async (req, res) => {
    const body = parseBody(ManualTimeSchema, req.body);
    const entry = await addManualTime(req.params.id, body.durationMinutes, body.date);
    res.status(201).json(entry);
  }),
);

// Список записей времени задачи
timeRouter.get('/tasks/:id/time', (req, res) => {
  res.json(getTaskTime(req.params.id));
});
