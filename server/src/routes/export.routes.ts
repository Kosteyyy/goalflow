import { Router } from 'express';
import { asyncHandler } from '../middleware/error';
import { parseBody } from '../utils/http';
import { ExportPayloadSchema } from '../schemas';
import { exportAll, importAll } from '../services/export.service';

export const exportRouter = Router();

exportRouter.get('/export', (_req, res) => {
  res.json(exportAll());
});

exportRouter.post(
  '/import',
  asyncHandler(async (req, res) => {
    const payload = parseBody(ExportPayloadSchema, req.body);
    await importAll(payload);
    res.json({ ok: true });
  }),
);
