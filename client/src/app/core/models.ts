export type GoalStatus = 'active' | 'archived';
export type ProjectStatus = 'active' | 'archived';
export type TaskStatus = 'todo' | 'doing' | 'done' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high';

export interface Progress { done: number; total: number; percent: number; }

export interface Goal {
  id: string;
  title: string;
  description: string;
  status: GoalStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
  progress?: Progress;
}

export interface Project {
  id: string;
  goalId: string;
  title: string;
  description: string;
  status: ProjectStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
  progress?: Progress;
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  projectId: string | null;
  description: string;
  priority: Priority | null;
  dueDate: string | null;
  estimateMinutes: number | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  spentMinutes?: number;
  activeTimer?: TimeEntry | null;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  startTime: string;
  endTime: string | null;
  durationMinutes: number;
  source: 'timer' | 'manual';
  truncated: boolean;
  createdAt: string;
}

export interface TaskTimeInfo {
  total: number;
  today: number;
  active: TimeEntry | null;
  entries: TimeEntry[];
}

export type PresetId =
  | 'inbox'
  | 'today'
  | 'overdue'
  | 'in_progress'
  | 'done'
  | 'spent_gt_4h'
  | 'no_time';

export type Selection =
  | { kind: 'preset'; id: PresetId }
  | { kind: 'goal'; id: string }
  | { kind: 'project'; id: string };

export interface Filters {
  statuses: TaskStatus[];
  projectId: string | null;
  goalId: string | null;
  tags: string[];
  dueFrom: string | null;
  dueTo: string | null;
  spentMin: number | null;
  spentMax: number | null;
}

export const EMPTY_FILTERS: Filters = {
  statuses: [],
  projectId: null,
  goalId: null,
  tags: [],
  dueFrom: null,
  dueTo: null,
  spentMin: null,
  spentMax: null,
};

export const PRESETS: { id: PresetId; label: string }[] = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'today', label: 'Сегодня' },
  { id: 'overdue', label: 'Просрочено' },
  { id: 'in_progress', label: 'В работе' },
  { id: 'done', label: 'Выполнено' },
  { id: 'spent_gt_4h', label: 'Потрачено > 4 ч' },
  { id: 'no_time', label: 'Без времени' },
];
