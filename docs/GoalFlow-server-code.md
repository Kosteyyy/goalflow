Структура
text
server/
├── package.json
├── tsconfig.json
├── .gitignore
└── src/
    ├── index.ts
    ├── config.ts
    ├── storage.ts
    ├── schemas.ts
    ├── middleware/
    │   └── error.ts
    ├── utils/
    │   ├── http.ts
    │   ├── cascade.ts
    │   ├── progress.ts
    │   └── timer.ts
    ├── services/
    │   ├── goals.service.ts
    │   ├── projects.service.ts
    │   ├── tasks.service.ts
    │   ├── time.service.ts
    │   └── export.service.ts
    └── routes/
        ├── goals.routes.ts
        ├── projects.routes.ts
        ├── tasks.routes.ts
        ├── time.routes.ts
        ├── tags.routes.ts
        └── export.routes.ts
package.json
json
{
  "name": "goalflow-server",
  "version": "1.0.0",
  "private": true,
  "type": "commonjs",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.19.2",
    "fs-extra": "^11.2.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/fs-extra": "^11.0.4",
    "@types/node": "^20.12.7",
    "tsx": "^4.7.0",
    "typescript": "^5.4.5"
  }
}
tsconfig.json
json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "moduleResolution": "Node",
    "lib": ["ES2022"],
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "sourceMap": true
  },
  "include": ["src/**/*"]
}
.gitignore
text
node_modules/
dist/
data/
*.log
src/config.ts
typescript
import path from 'path';

const dataDir = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.resolve(process.cwd(), 'data');

export const config = {
  port: Number(process.env.PORT) || 3000,
  dataDir,
  files: {
    goals: path.join(dataDir, 'goals.json'),
    projects: path.join(dataDir, 'projects.json'),
    tasks: path.join(dataDir, 'tasks.json'),
    timeEntries: path.join(dataDir, 'timeEntries.json'),
    settings: path.join(dataDir, 'settings.json'),
  },
  maxTimerMinutes: 480, // 8 часов
  exportVersion: '1.0',
};
src/schemas.ts
typescript
import { z } from 'zod';

export const GoalStatus = z.enum(['active', 'archived']);
export const ProjectStatus = z.enum(['active', 'archived']);
export const TaskStatus = z.enum(['todo', 'doing', 'done', 'cancelled']);
export const Priority = z.enum(['low', 'medium', 'high']);
export const TimeSource = z.enum(['timer', 'manual']);

// --- Goal ---
export const GoalSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().max(5000),
  status: GoalStatus,
  order: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateGoalSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  status: GoalStatus.optional(),
  order: z.number().optional(),
});

export const UpdateGoalSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  status: GoalStatus.optional(),
  order: z.number().optional(),
});

// --- Project ---
export const ProjectSchema = z.object({
  id: z.string(),
  goalId: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().max(5000),
  status: ProjectStatus,
  order: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateProjectSchema = z.object({
  goalId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  status: ProjectStatus.optional(),
  order: z.number().optional(),
});

export const UpdateProjectSchema = z.object({
  goalId: z.string().min(1).optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  status: ProjectStatus.optional(),
  order: z.number().optional(),
});

// --- Task ---
export const TaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  status: TaskStatus,
  projectId: z.string().nullable(),
  description: z.string().max(5000),
  priority: Priority.nullable(),
  dueDate: z.string().nullable(),
  estimateMinutes: z.number().int().min(0).max(10000).nullable(),
  tags: z.array(z.string().min(1).max(50)).max(20),
  createdAt: z.string(),
  updatedAt: z.string(),
  completedAt: z.string().nullable(),
});

export const CreateTaskSchema = z.object({
  title: z.string().min(1).max(200),
  projectId: z.string().nullable().optional(),
  description: z.string().max(5000).optional(),
  priority: Priority.nullable().optional(),
  dueDate: z.string().nullable().optional(),
  estimateMinutes: z.number().int().min(0).max(10000).nullable().optional(),
  tags: z.array(z.string().min(1).max(50)).max(20).optional(),
  status: TaskStatus.optional(),
});

export const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  status: TaskStatus.optional(),
  projectId: z.string().nullable().optional(),
  description: z.string().max(5000).optional(),
  priority: Priority.nullable().optional(),
  dueDate: z.string().nullable().optional(),
  estimateMinutes: z.number().int().min(0).max(10000).nullable().optional(),
  tags: z.array(z.string().min(1).max(50)).max(20).optional(),
});

// --- TimeEntry ---
export const TimeEntrySchema = z.object({
  id: z.string(),
  taskId: z.string(),
  startTime: z.string(),
  endTime: z.string().nullable(),
  durationMinutes: z.number().int().min(0),
  source: TimeSource,
  truncated: z.boolean(),
  createdAt: z.string(),
});

export const ManualTimeSchema = z.object({
  durationMinutes: z.number().int().min(1).max(480),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
});

// --- Settings ---
export const SettingsSchema = z.object({
  maxTimerHours: z.number().int().min(1).max(24),
  theme: z.string(),
});

// --- Export payload ---
export const ExportPayloadSchema = z.object({
  version: z.string(),
  exportedAt: z.string().optional(),
  goals: z.array(GoalSchema),
  projects: z.array(ProjectSchema),
  tasks: z.array(TaskSchema),
  timeEntries: z.array(TimeEntrySchema),
  settings: SettingsSchema,
});

// --- Inferred types ---
export type Goal = z.infer<typeof GoalSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type TimeEntry = z.infer<typeof TimeEntrySchema>;
export type Settings = z.infer<typeof SettingsSchema>;
export type ExportPayload = z.infer<typeof ExportPayloadSchema>;
src/storage.ts
typescript
import fs from 'fs-extra';
import { config } from './config';
import type { Goal, Project, Task, TimeEntry, Settings } from './schemas';

export interface DataStore {
  goals: Goal[];
  projects: Project[];
  tasks: Task[];
  timeEntries: TimeEntry[];
  settings: Settings;
}

const defaultSettings: Settings = {
  maxTimerHours: 8,
  theme: 'light',
};

class Storage {
  private data: DataStore = {
    goals: [],
    projects: [],
    tasks: [],
    timeEntries: [],
    settings: { ...defaultSettings },
  };

  private locks = new Map<keyof DataStore, Promise<void>>();

  async init(): Promise<void> {
    await fs.ensureDir(config.dataDir);
    this.data.goals = await readJson(config.files.goals, []);
    this.data.projects = await readJson(config.files.projects, []);
    this.data.tasks = await readJson(config.files.tasks, []);
    this.data.timeEntries = await readJson(config.files.timeEntries, []);
    this.data.settings = await readJson(config.files.settings, { ...defaultSettings });

    // Пишем settings.json, если файла не было
    await fs.ensureFile(config.files.settings);
    const raw = await fs.readFile(config.files.settings, 'utf-8');
    if (!raw.trim()) {
      await fs.writeJson(config.files.settings, this.data.settings, { spaces: 2 });
    }
  }

  get goals(): Goal[] { return this.data.goals; }
  get projects(): Project[] { return this.data.projects; }
  get tasks(): Task[] { return this.data.tasks; }
  get timeEntries(): TimeEntry[] { return this.data.timeEntries; }
  get settings(): Settings { return this.data.settings; }

  async save(key: keyof DataStore): Promise<void> {
    const prev = this.locks.get(key) ?? Promise.resolve();
    const next = prev.then(() => this.writeFile(key)).catch((err) => {
      console.error(`[storage] write failed for ${key}:`, err);
    });
    this.locks.set(key, next);
    return next;
  }

  async saveAll(): Promise<void> {
    await Promise.all([
      this.save('goals'),
      this.save('projects'),
      this.save('tasks'),
      this.save('timeEntries'),
      this.save('settings'),
    ]);
  }

  async replaceAll(data: DataStore): Promise<void> {
    this.data = data;
    await this.saveAll();
  }

  private async writeFile(key: keyof DataStore): Promise<void> {
    const file = config.files[key];
    const tmp = `${file}.tmp`;
    const value = this.data[key];
    await fs.writeFile(tmp, JSON.stringify(value, null, 2), 'utf-8');
    await fs.rename(tmp, file);
  }
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    if (!(await fs.pathExists(file))) return fallback;
    const raw = await fs.readFile(file, 'utf-8');
    if (!raw.trim()) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`[storage] failed to read ${file}, using fallback`, err);
    return fallback;
  }
}

export const storage = new Storage();
src/utils/http.ts
typescript
import type { ZodSchema } from 'zod';

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const notFound = (entity: string, id: string): HttpError =>
  new HttpError(404, `${entity} ${id} not found`);

export const badRequest = (message: string, details?: unknown): HttpError =>
  new HttpError(400, message, details);

export function parseBody<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new HttpError(400, 'validation_error', result.error.flatten());
  }
  return result.data;
}
src/utils/progress.ts
typescript
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
src/utils/cascade.ts
typescript
import { storage } from '../storage';

/**
 * Удаляет цель и все связанные проекты, задачи и записи времени.
 * Синхронно мутирует in-memory данные — сохранение выполняет вызывающий.
 */
export function cascadeDeleteGoal(goalId: string): void {
  const projectIds = new Set(
    storage.projects.filter((p) => p.goalId === goalId).map((p) => p.id),
  );

  const taskIds = new Set(
    storage.tasks
      .filter((t) => t.projectId !== null && projectIds.has(t.projectId))
      .map((t) => t.id),
  );

  storage.timeEntries = storage.timeEntries.filter((e) => !taskIds.has(e.taskId));
  storage.tasks = storage.tasks.filter((t) => !taskIds.has(t.id));
  storage.projects = storage.projects.filter((p) => !projectIds.has(p.id));
  storage.goals = storage.goals.filter((g) => g.id !== goalId);
}

export function cascadeDeleteProject(projectId: string): void {
  const taskIds = new Set(
    storage.tasks.filter((t) => t.projectId === projectId).map((t) => t.id),
  );
  storage.timeEntries = storage.timeEntries.filter((e) => !taskIds.has(e.taskId));
  storage.tasks = storage.tasks.filter((t) => t.projectId !== projectId);
  storage.projects = storage.projects.filter((p) => p.id !== projectId);
}

export function cascadeDeleteTask(taskId: string): void {
  storage.timeEntries = storage.timeEntries.filter((e) => e.taskId !== taskId);
  storage.tasks = storage.tasks.filter((t) => t.id !== taskId);
}
src/utils/timer.ts
typescript
import { storage } from '../storage';
import { config } from '../config';
import type { TimeEntry } from '../schemas';

/**
 * Если активный таймер идёт дольше лимита — обрезает его до 8 ч.
 * Возвращает true, если была авто-остановка.
 */
export async function ensureActiveTimerValid(): Promise<boolean> {
  const active = storage.timeEntries.find((e) => e.endTime === null);
  if (!active) return false;

  const start = new Date(active.startTime).getTime();
  const limitMs = config.maxTimerMinutes * 60_000;
  const now = Date.now();
  if (now - start <= limitMs) return false;

  const end = new Date(start + limitMs);
  active.endTime = end.toISOString();
  active.durationMinutes = config.maxTimerMinutes;
  active.truncated = true;

  await storage.save('timeEntries');
  return true;
}

export function getActiveTimer(): TimeEntry | null {
  return storage.timeEntries.find((e) => e.endTime === null) ?? null;
}
src/middleware/error.ts
typescript
import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../utils/http';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: err.message,
      details: err.details ?? null,
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'validation_error',
      details: err.flatten(),
    });
    return;
  }

  console.error('[unhandled error]', err);
  res.status(500).json({ error: 'internal_error' });
}

export const asyncHandler =
  <T extends Request = Request>(
    fn: (req: T, res: Response, next: NextFunction) => unknown,
  ) =>
  (req: T, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
src/services/goals.service.ts
typescript
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
src/services/projects.service.ts
typescript
import { randomUUID } from 'crypto';
import { storage } from '../storage';
import { notFound } from '../utils/http';
import { cascadeDeleteProject } from '../utils/cascade';
import { projectProgress } from '../utils/progress';
import { assertGoalExists } from './goals.service';
import type { Project } from '../schemas';

export interface ProjectView extends Project {
  progress: { done: number; total: number; percent: number };
}

function decorate(project: Project): ProjectView {
  return { ...project, progress: projectProgress(project.id) };
}

export function listProjects(goalId?: string): ProjectView[] {
  const list = goalId
    ? storage.projects.filter((p) => p.goalId === goalId)
    : storage.projects;
  return [...list].sort((a, b) => a.order - b.order).map(decorate);
}

export function getProject(id: string): Project {
  const project = storage.projects.find((p) => p.id === id);
  if (!project) throw notFound('Project', id);
  return project;
}

export async function createProject(
  input: Partial<Project> & { title: string; goalId: string },
): Promise<ProjectView> {
  assertGoalExists(input.goalId);
  const now = new Date().toISOString();
  const project: Project = {
    id: randomUUID(),
    goalId: input.goalId,
    title: input.title,
    description: input.description ?? '',
    status: input.status ?? 'active',
    order: input.order ?? nextOrder(input.goalId),
    createdAt: now,
    updatedAt: now,
  };
  storage.projects.push(project);
  await storage.save('projects');
  return decorate(project);
}

export async function updateProject(
  id: string,
  patch: Partial<Omit<Project, 'id' | 'createdAt'>>,
): Promise<ProjectView> {
  const project = getProject(id);
  if (patch.goalId && patch.goalId !== project.goalId) {
    assertGoalExists(patch.goalId);
  }
  Object.assign(project, patch, { id: project.id, updatedAt: new Date().toISOString() });
  await storage.save('projects');
  return decorate(project);
}

export async function deleteProject(id: string): Promise<void> {
  getProject(id);
  cascadeDeleteProject(id);
  await Promise.all([
    storage.save('projects'),
    storage.save('tasks'),
    storage.save('timeEntries'),
  ]);
}

function nextOrder(goalId: string): number {
  return (
    storage.projects
      .filter((p) => p.goalId === goalId)
      .reduce((max, p) => Math.max(max, p.order), -1) + 1
  );
}

export function assertProjectExists(projectId: string): void {
  if (!storage.projects.some((p) => p.id === projectId)) {
    throw new (require('../utils/http').HttpError)(
      400,
      `project ${projectId} does not exist`,
    );
  }
}
src/services/tasks.service.ts
typescript
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
src/services/time.service.ts
typescript
import { randomUUID } from 'crypto';
import { storage } from '../storage';
import { config } from '../config';
import { HttpError } from '../utils/http';
import { ensureActiveTimerValid, getActiveTimer } from '../utils/timer';
import { getTask } from './tasks.service';
import type { TimeEntry } from '../schemas';

export interface TaskTimeInfo {
  total: number;
  today: number;
  active: TimeEntry | null;
  entries: TimeEntry[];
}

export async function startTimer(taskId: string): Promise<TimeEntry> {
  getTask(taskId);
  await ensureActiveTimerValid();

  const active = getActiveTimer();
  if (active) {
    await stopEntry(active);
  }

  const now = new Date().toISOString();
  const entry: TimeEntry = {
    id: randomUUID(),
    taskId,
    startTime: now,
    endTime: null,
    durationMinutes: 0,
    source: 'timer',
    truncated: false,
    createdAt: now,
  };
  storage.timeEntries.push(entry);
  await storage.save('timeEntries');
  return entry;
}

export async function stopTimer(taskId: string): Promise<TimeEntry> {
  getTask(taskId);
  await ensureActiveTimerValid();

  const active = storage.timeEntries.find(
    (e) => e.endTime === null && e.taskId === taskId,
  );
  if (!active) {
    throw new HttpError(400, `no active timer for task ${taskId}`);
  }
  await stopEntry(active);
  return active;
}

export async function stopActiveTimer(): Promise<TimeEntry | null> {
  await ensureActiveTimerValid();
  const active = getActiveTimer();
  if (!active) return null;
  await stopEntry(active);
  return active;
}

async function stopEntry(entry: TimeEntry): Promise<void> {
  const start = new Date(entry.startTime).getTime();
  const end = Date.now();
  let duration = Math.max(0, Math.round((end - start) / 60_000));
  let truncated = false;

  if (duration > config.maxTimerMinutes) {
    duration = config.maxTimerMinutes;
    truncated = true;
  }

  entry.endTime = new Date(start + duration * 60_000).toISOString();
  entry.durationMinutes = duration;
  entry.truncated = truncated;

  await storage.save('timeEntries');
}

export async function addManualTime(
  taskId: string,
  durationMinutes: number,
  date: string,
): Promise<TimeEntry> {
  getTask(taskId);

  const startTime = new Date(`${date}T00:00:00`);
  if (Number.isNaN(startTime.getTime())) {
    throw new HttpError(400, 'invalid date');
  }
  const endTime = new Date(startTime.getTime() + durationMinutes * 60_000);

  const entry: TimeEntry = {
    id: randomUUID(),
    taskId,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    durationMinutes,
    source: 'manual',
    truncated: false,
    createdAt: new Date().toISOString(),
  };
  storage.timeEntries.push(entry);
  await storage.save('timeEntries');
  return entry;
}

export function getTaskTime(taskId: string): TaskTimeInfo {
  getTask(taskId);

  const entries = storage.timeEntries.filter((e) => e.taskId === taskId);
  const total = entries
    .filter((e) => e.endTime !== null)
    .reduce((sum, e) => sum + e.durationMinutes, 0);

  const todayIso = new Date().toISOString().slice(0, 10);
  const today = entries
    .filter((e) => e.endTime !== null && e.startTime.slice(0, 10) === todayIso)
    .reduce((sum, e) => sum + e.durationMinutes, 0);

  const active = entries.find((e) => e.endTime === null) ?? null;

  return { total, today, active, entries };
}

export async function getActive(): Promise<TimeEntry | null> {
  await ensureActiveTimerValid();
  return getActiveTimer();
}
src/services/export.service.ts
typescript
import { storage } from '../storage';
import { config } from '../config';
import type { ExportPayload } from '../schemas';

export function exportAll(): ExportPayload {
  return {
    version: config.exportVersion,
    exportedAt: new Date().toISOString(),
    goals: storage.goals,
    projects: storage.projects,
    tasks: storage.tasks,
    timeEntries: storage.timeEntries,
    settings: storage.settings,
  };
}

export async function importAll(payload: ExportPayload): Promise<void> {
  await storage.replaceAll({
    goals: payload.goals,
    projects: payload.projects,
    tasks: payload.tasks,
    timeEntries: payload.timeEntries,
    settings: payload.settings,
  });
}
src/routes/goals.routes.ts
typescript
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
src/routes/projects.routes.ts
typescript
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
src/routes/tasks.routes.ts
typescript
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
src/routes/time.routes.ts
typescript
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
src/routes/tags.routes.ts
typescript
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
src/routes/export.routes.ts
typescript
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
src/index.ts
typescript
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
Запуск
bash
cd server
npm install
npm run dev