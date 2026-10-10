import { randomUUID } from 'crypto';
import { storage } from '../storage';
import { HttpError, notFound } from '../utils/http';
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
    throw new HttpError(400, `project ${projectId} does not exist`);
  }
}
