import { randomUUID } from 'crypto';
import { storage } from '../storage';
import { HttpError, notFound } from '../utils/http';
import { cascadeDeleteGoal } from '../utils/cascade';
import { goalProgress } from '../utils/progress';
import type { Goal } from '../schemas';

export interface GoalView extends Goal {
  progress: { done: number; total: number; percent: number };
}

function decorate(goal: Goal): GoalView {
  return { ...goal, progress: goalProgress(goal.id) };
}

export function listGoals(): GoalView[] {
  return [...storage.goals]
    .sort((a, b) => a.order - b.order)
    .map(decorate);
}

export function getGoal(id: string): Goal {
  const goal = storage.goals.find((g) => g.id === id);
  if (!goal) throw notFound('Goal', id);
  return goal;
}

export async function createGoal(input: Partial<Goal> & { title: string }): Promise<GoalView> {
  const now = new Date().toISOString();
  const goal: Goal = {
    id: randomUUID(),
    title: input.title,
    description: input.description ?? '',
    status: input.status ?? 'active',
    order: input.order ?? nextOrder(),
    createdAt: now,
    updatedAt: now,
  };
  storage.goals.push(goal);
  await storage.save('goals');
  return decorate(goal);
}

export async function updateGoal(
  id: string,
  patch: Partial<Omit<Goal, 'id' | 'createdAt'>>,
): Promise<GoalView> {
  const goal = getGoal(id);
  Object.assign(goal, patch, { id: goal.id, updatedAt: new Date().toISOString() });
  await storage.save('goals');
  return decorate(goal);
}

export async function deleteGoal(id: string): Promise<void> {
  getGoal(id);
  cascadeDeleteGoal(id);
  await Promise.all([
    storage.save('goals'),
    storage.save('projects'),
    storage.save('tasks'),
    storage.save('timeEntries'),
  ]);
}

function nextOrder(): number {
  return storage.goals.reduce((max, g) => Math.max(max, g.order), -1) + 1;
}

// Вспомогательная функция для проверки существования цели из других сервисов
export function assertGoalExists(goalId: string): void {
  if (!storage.goals.some((g) => g.id === goalId)) {
    throw new HttpError(400, `goal ${goalId} does not exist`);
  }
}
