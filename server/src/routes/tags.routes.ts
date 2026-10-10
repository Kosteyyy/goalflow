import { Router } from 'express';
import { storage } from '../storage';

export const tagsRouter = Router();

tagsRouter.get('/', (_req, res) => {
  const set = new Set<string>();
  for (const task of storage.tasks) {
    for (const tag of task.tags) set.add(tag);
  }
  res.json([...set].sort((a, b) => a.localeCompare(b)));
});
