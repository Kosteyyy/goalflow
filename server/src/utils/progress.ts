import { storage } from '../storage';
import type { Task } from '../schemas';

export interface Progress {
  done: number;
  total: number;
  percent: number;
}

function compute(tasks: Task[]): Progress {
  const active = tasks.filter((t) => t.status !== 'cancelled');
  const total = active.length;
  const done = active.filter((t) => t.status === 'done').length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, percent };
}

export function projectProgress(projectId: string): Progress {
  const tasks = storage.tasks.filter((t) => t.projectId === projectId);
  return compute(tasks);
}

export function goalProgress(goalId: string): Progress {
  const projectIds = new Set(
    storage.projects.filter((p) => p.goalId === goalId).map((p) => p.id),
  );
  const tasks = storage.tasks.filter(
    (t) => t.projectId !== null && projectIds.has(t.projectId),
  );
  return compute(tasks);
}
