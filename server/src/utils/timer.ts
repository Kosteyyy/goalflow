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
