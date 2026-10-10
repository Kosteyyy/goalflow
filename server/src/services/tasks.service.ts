import { randomUUID } from 'crypto';
import { storage } from '../storage';
import { notFound } from '../utils/http';
import { cascadeDeleteTask } from '../utils/cascade';
import { assertProjectExists } from './projects.service';
import type { Task, TimeEntry } from '../schemas';

export interface TaskView extends Task {
  spentMinutes: number;
  activeTimer: TimeEntry | null;
}

function decorate(task: Task): TaskView {
  const entries = storage.timeEntries.filter((e) => e.taskId === task.id);
  const spentMinutes = entries
    .filter((e) => e.endTime !== null)
    .reduce((sum, e) => sum + e.durationMinutes, 0);
  const activeTimer = entries.find((e) => e.endTime === null) ?? null;
  return { ...task, spentMinutes, activeTimer };
}

export interface TaskFilter {
  projectId?: string | null;
  status?: Task['status'];
  tag?: string;
}

export function listTasks(filter: TaskFilter = {}): TaskView[] {
  let list = storage.tasks;
  if (filter.projectId !== undefined) {
    list = list.filter((t) => t.projectId === filter.projectId);
  }
  if (filter.status) {
    list = list.filter((t) => t.status === filter.status);
  }
  if (filter.tag) {
    list = list.filter((t) => t.tags.includes(filter.tag!));
  }
  return list.map(decorate);
}

export function getTask(id: string): Task {
  const task = storage.tasks.find((t) => t.id === id);
  if (!task) throw notFound('Task', id);
  return task;
}

export function getTaskView(id: string): TaskView {
  return decorate(getTask(id));
}

export async function createTask(
  input: Partial<Task> & { title: string },
): Promise<TaskView> {
  if (input.projectId) assertProjectExists(input.projectId);

  const now = new Date().toISOString();
  const status = input.status ?? 'todo';
  const task: Task = {
    id: randomUUID(),
    title: input.title,
    status,
    projectId: input.projectId ?? null,
    description: input.description ?? '',
    priority: input.priority ?? null,
    dueDate: input.dueDate ?? null,
    estimateMinutes: input.estimateMinutes ?? null,
    tags: input.tags ?? [],
    createdAt: now,
    updatedAt: now,
    completedAt: status === 'done' ? now : null,
  };
  storage.tasks.push(task);
  await storage.save('tasks');
  return decorate(task);
}

export async function updateTask(
  id: string,
  patch: Partial<Omit<Task, 'id' | 'createdAt'>>,
): Promise<TaskView> {
  const task = getTask(id);
  const prevStatus = task.status;

  if (patch.projectId) assertProjectExists(patch.projectId);

  Object.assign(task, patch, { id: task.id, updatedAt: new Date().toISOString() });

  if (patch.status && patch.status !== prevStatus) {
    if (patch.status === 'done') {
      task.completedAt = task.completedAt ?? new Date().toISOString();
    } else {
      task.completedAt = null;
    }
  }

  await storage.save('tasks');
  return decorate(task);
}

export async function deleteTask(id: string): Promise<void> {
  getTask(id);
  cascadeDeleteTask(id);
  await Promise.all([
    storage.save('tasks'),
    storage.save('timeEntries'),
  ]);
}
