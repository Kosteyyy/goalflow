import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type {
  Goal, Project, Task, TimeEntry, TaskTimeInfo,
} from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiBase;
  private http = inject(HttpClient);

  // --- Goals ---
  listGoals(): Observable<Goal[]> {
    return this.http.get<Goal[]>(`${this.base}/goals`);
  }
  createGoal(body: Partial<Goal>): Observable<Goal> {
    return this.http.post<Goal>(`${this.base}/goals`, body);
  }
  updateGoal(id: string, body: Partial<Goal>): Observable<Goal> {
    return this.http.put<Goal>(`${this.base}/goals/${id}`, body);
  }
  deleteGoal(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/goals/${id}`);
  }

  // --- Projects ---
  listProjects(goalId?: string): Observable<Project[]> {
    const params = goalId ? new HttpParams().set('goalId', goalId) : undefined;
    return this.http.get<Project[]>(`${this.base}/projects`, { params });
  }
  createProject(body: Partial<Project>): Observable<Project> {
    return this.http.post<Project>(`${this.base}/projects`, body);
  }
  updateProject(id: string, body: Partial<Project>): Observable<Project> {
    return this.http.put<Project>(`${this.base}/projects/${id}`, body);
  }
  deleteProject(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/projects/${id}`);
  }

  // --- Tasks ---
  listTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.base}/tasks`);
  }
  getTask(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.base}/tasks/${id}`);
  }
  createTask(body: Partial<Task>): Observable<Task> {
    return this.http.post<Task>(`${this.base}/tasks`, body);
  }
  updateTask(id: string, body: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`${this.base}/tasks/${id}`, body);
  }
  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/tasks/${id}`);
  }

  // --- Time ---
  startTimer(taskId: string): Observable<TimeEntry> {
    return this.http.post<TimeEntry>(`${this.base}/tasks/${taskId}/timer/start`, {});
  }
  stopTimer(taskId: string): Observable<TimeEntry> {
    return this.http.post<TimeEntry>(`${this.base}/tasks/${taskId}/timer/stop`, {});
  }
  addManualTime(taskId: string, durationMinutes: number, date: string): Observable<TimeEntry> {
    return this.http.post<TimeEntry>(
      `${this.base}/tasks/${taskId}/time/manual`,
      { durationMinutes, date },
    );
  }
  getTaskTime(taskId: string): Observable<TaskTimeInfo> {
    return this.http.get<TaskTimeInfo>(`${this.base}/tasks/${taskId}/time`);
  }
  getActiveTimer(): Observable<TimeEntry | null> {
    return this.http.get<TimeEntry | null>(`${this.base}/timer/active`);
  }

  // --- Tags ---
  listTags(): Observable<string[]> {
    return this.http.get<string[]>(`${this.base}/tags`);
  }

  // --- Export / Import ---
  exportAll(): Observable<unknown> {
    return this.http.get<unknown>(`${this.base}/export`);
  }
  importAll(payload: unknown): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${this.base}/import`, payload);
  }
}
