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
