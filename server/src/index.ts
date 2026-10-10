import express from 'express';
import cors from 'cors';
import { storage } from './storage';
import { config } from './config';
import { errorHandler } from './middleware/error';
import { goalsRouter } from './routes/goals.routes';
import { projectsRouter } from './routes/projects.routes';
import { tasksRouter } from './routes/tasks.routes';
import { timeRouter } from './routes/time.routes';
import { tagsRouter } from './routes/tags.routes';
import { exportRouter } from './routes/export.routes';
import { ensureActiveTimerValid } from './utils/timer';

async function main(): Promise<void> {
  await storage.init();
  await ensureActiveTimerValid();

  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, time: new Date().toISOString() });
  });

  app.use('/api/goals', goalsRouter);
  app.use('/api/projects', projectsRouter);
  app.use('/api/tasks', tasksRouter);
  app.use('/api', timeRouter);
  app.use('/api/tags', tagsRouter);
  app.use('/api', exportRouter);

  app.use(errorHandler);

  app.listen(config.port, () => {
    console.log(`[goalflow] server listening on http://localhost:${config.port}`);
    console.log(`[goalflow] data dir: ${config.dataDir}`);
  });
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
