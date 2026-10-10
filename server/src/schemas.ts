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
