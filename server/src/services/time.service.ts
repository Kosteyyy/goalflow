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
