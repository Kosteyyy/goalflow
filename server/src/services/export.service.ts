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
