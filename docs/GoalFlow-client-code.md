# GoalFlow — Angular Client (полный код)

Ниже — весь код клиента. Angular 17+, standalone components, signals, новая control flow (`@if`, `@for`). Все компоненты — self-contained, можно копировать как есть.

## Структура

```
client/
├── package.json
├── angular.json
├── tsconfig.json
├── tsconfig.app.json
└── src/
    ├── main.ts
    ├── index.html
    ├── styles.scss
    ├── environments/
    │   └── environment.ts
    └── app/
        ├── app.component.ts
        ├── app.config.ts
        ├── core/
        │   ├── models.ts
        │   ├── format.ts
        │   ├── api.service.ts
        │   ├── state.service.ts
        │   ├── toast.service.ts
        │   └── hotkeys.service.ts
        ├── shared/
        │   └── toast.component.ts
        └── features/
            ├── sidebar.component.ts
            ├── top-bar.component.ts
            ├── task-list.component.ts
            ├── task-row.component.ts
            ├── task-card.component.ts
            ├── quick-capture.component.ts
            ├── command-palette.component.ts
            ├── filters-popover.component.ts
            └── entity-form.component.ts
```

---

## Корневые файлы

### `client/package.json`

```json
{
  "name": "goalflow-client",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "ng serve --proxy-config proxy.conf.json",
    "build": "ng build",
    "watch": "ng build --watch --configuration development"
  },
  "dependencies": {
    "@angular/animations": "^17.3.0",
    "@angular/common": "^17.3.0",
    "@angular/compiler": "^17.3.0",
    "@angular/core": "^17.3.0",
    "@angular/forms": "^17.3.0",
    "@angular/platform-browser": "^17.3.0",
    "@angular/platform-browser-dynamic": "^17.3.0",
    "rxjs": "~7.8.0",
    "tslib": "^2.3.0",
    "zone.js": "~0.14.3"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^17.3.0",
    "@angular/cli": "^17.3.0",
    "@angular/compiler-cli": "^17.3.0",
    "typescript": "~5.4.2"
  }
}
```

### `client/proxy.conf.json`

```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true
  }
}
```

### `client/angular.json`

```json
{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "version": 1,
  "newProjectRoot": "projects",
  "projects": {
    "goalflow": {
      "projectType": "application",
      "root": "",
      "sourceRoot": "src",
      "prefix": "app",
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:application",
          "options": {
            "outputPath": "dist/goalflow",
            "index": "src/index.html",
            "browser": "src/main.ts",
            "polyfills": ["zone.js"],
            "tsConfig": "tsconfig.app.json",
            "assets": [],
            "styles": ["src/styles.scss"],
            "scripts": []
          },
          "configurations": {
            "production": {
              "budgets": [
                { "type": "initial", "maximumWarning": "1mb", "maximumError": "2mb" }
              ],
              "outputHashing": "all"
            },
            "development": {
              "optimization": false,
              "extractLicenses": false,
              "sourceMap": true
            }
          },
          "defaultConfiguration": "production"
        },
        "serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          "configurations": {
            "production": { "buildTarget": "goalflow:build:production" },
            "development": { "buildTarget": "goalflow:build:development" }
          },
          "defaultConfiguration": "development"
        }
      }
    }
  }
}
```

### `client/tsconfig.json`

```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "outDir": "./dist/out-tsc",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": false,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "sourceMap": true,
    "declaration": false,
    "experimentalDecorators": true,
    "moduleResolution": "bundler",
    "importHelpers": true,
    "target": "ES2022",
    "module": "ES2022",
    "useDefineForClassFields": false,
    "lib": ["ES2022", "dom"]
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
```

### `client/tsconfig.app.json`

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/app",
    "types": []
  },
  "files": ["src/main.ts"],
  "include": ["src/**/*.d.ts"]
}
```

---

## `client/src/main.ts`

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
```

### `client/src/index.html`

```html
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <title>GoalFlow</title>
  <base href="/" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body>
  <app-root></app-root>
</body>
</html>
```

### `client/src/environments/environment.ts`

```typescript
export const environment = {
  apiBase: '/api',
};
```

### `client/src/styles.scss`

```scss
* { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  color: #1a1a1a;
  background: #fff;
}

button {
  font-family: inherit;
  font-size: inherit;
  cursor: pointer;
  border: none;
  background: none;
  color: inherit;
}

input, textarea, select {
  font-family: inherit;
  font-size: inherit;
}

:root {
  --border: #e5e5e5;
  --border-strong: #d0d0d0;
  --text-muted: #888;
  --text-soft: #666;
  --bg-hover: #f5f5f5;
  --bg-active: #eef4ff;
  --accent: #2563eb;
  --accent-hover: #1d4ed8;
  --danger: #dc2626;
  --warning: #d97706;
  --success: #16a34a;
  --sidebar-width: 260px;
}
```

---

## `client/src/app/app.config.ts`

```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(),
  ],
};
```

---

## Core

### `client/src/app/core/models.ts`

```typescript
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
```

---

### `client/src/app/core/format.ts`

```typescript
export function fmtMinutes(min: number | null | undefined): string {
  if (min == null || min <= 0) return '0м';
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}м`;
  if (m === 0) return `${h}ч`;
  return `${h}ч ${m}м`;
}

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
}

export function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('ru-RU', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

export function isToday(iso: string | null): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function isPast(iso: string | null): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return d.getTime() < now.getTime();
}

export function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
```

---

### `client/src/app/core/api.service.ts`

```typescript
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
```

---

### `client/src/app/core/toast.service.ts`

```typescript
import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  type: 'success' | 'warning' | 'error';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private counter = 0;

  success(message: string): void { this.push('success', message); }
  warning(message: string): void { this.push('warning', message); }
  error(message: string): void { this.push('error', message); }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private push(type: Toast['type'], message: string): void {
    const id = ++this.counter;
    this.toasts.update((list) => [...list, { id, type, message }]);
    setTimeout(() => this.dismiss(id), 4000);
  }
}
```

---

### `client/src/app/core/hotkeys.service.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { StateService } from './state.service';

@Injectable({ providedIn: 'root' })
export class HotkeysService {
  private state = inject(StateService);
  private pendingG = false;
  private pendingTimeout: ReturnType<typeof setTimeout> | null = null;

  init(): void {
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
  }

  private onKeyDown(e: KeyboardEvent): void {
    const target = e.target as HTMLElement;
    const inInput = target && (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    );

    // Cmd+K / Ctrl+K — всегда работает
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      this.state.toggleCommandPalette();
      return;
    }

    // Esc — закрыть всё
    if (e.key === 'Escape') {
      this.state.closeAllModals();
      return;
    }

    if (inInput) return;

    // G-префикс
    if (this.pendingG) {
      this.pendingG = false;
      if (this.pendingTimeout) clearTimeout(this.pendingTimeout);
      const k = e.key.toLowerCase();
      if (k === 'g') this.state.selectPreset('inbox');
      else if (k === 'p') this.state.selectPreset('in_progress');
      else if (k === 't') this.state.selectPreset('today');
      e.preventDefault();
      return;
    }

    switch (e.key.toLowerCase()) {
      case 'n':
        e.preventDefault();
        this.state.openQuickCapture();
        break;
      case '/':
        e.preventDefault();
        this.state.requestSearchFocus();
        break;
      case 'g':
        e.preventDefault();
        this.pendingG = true;
        this.pendingTimeout = setTimeout(() => { this.pendingG = false; }, 800);
        break;
      case 'e':
        if (this.state.selectedTaskId()) {
          e.preventDefault();
          this.state.openTaskCard(this.state.selectedTaskId()!);
        }
        break;
      case ' ':
        if (this.state.selectedTaskId()) {
          e.preventDefault();
          this.state.toggleTimer(this.state.selectedTaskId()!);
        }
        break;
    }
  }
}
```

---

### `client/src/app/core/state.service.ts`

```typescript
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { ToastService } from './toast.service';
import type {
  Filters, Goal, PresetId, Project, Selection, Task, TaskStatus, TimeEntry,
} from './models';
import { EMPTY_FILTERS } from './models';
import { isPast, isToday } from './format';

@Injectable({ providedIn: 'root' })
export class StateService {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  // --- Data signals ---
  readonly goals = signal<Goal[]>([]);
  readonly projects = signal<Project[]>([]);
  readonly tasks = signal<Task[]>([]);
  readonly tags = signal<string[]>([]);
  readonly activeTimer = signal<TimeEntry | null>(null);

  // --- UI signals ---
  readonly selection = signal<Selection>({ kind: 'preset', id: 'inbox' });
  readonly filters = signal<Filters>({ ...EMPTY_FILTERS });
  readonly searchQuery = signal('');
  readonly selectedTaskId = signal<string | null>(null);

  // --- Modals ---
  readonly quickCaptureOpen = signal(false);
  readonly commandPaletteOpen = signal(false);
  readonly filtersOpen = signal(false);
  readonly editingTaskId = signal<string | null>(null);
  readonly editingGoalId = signal<string | null>(null);
  readonly editingProjectId = signal<string | null>(null);
  readonly exportOpen = signal(false);

  // --- Search focus event ---
  readonly focusSearchTick = signal(0);
  requestSearchFocus(): void { this.focusSearchTick.update((v) => v + 1); }

  // --- Computed ---
  readonly visibleTasks = computed(() => {
    const sel = this.selection();
    const f = this.filters();
    const query = this.searchQuery().trim().toLowerCase();
    let list = this.tasks();

    if (sel.kind === 'preset') {
      switch (sel.id) {
        case 'inbox':
          list = list.filter((t) => t.projectId === null);
          break;
        case 'today':
          list = list.filter((t) => isToday(t.dueDate) && t.status !== 'cancelled');
          break;
        case 'overdue':
          list = list.filter((t) => isPast(t.dueDate) && t.status !== 'done' && t.status !== 'cancelled');
          break;
        case 'in_progress':
          list = list.filter((t) => t.status === 'doing');
          break;
        case 'done':
          list = list.filter((t) => t.status === 'done');
          break;
        case 'spent_gt_4h':
          list = list.filter((t) => (t.spentMinutes ?? 0) > 240);
          break;
        case 'no_time':
          list = list.filter((t) => (t.spentMinutes ?? 0) === 0 && !t.activeTimer);
          break;
      }
    } else if (sel.kind === 'project') {
      list = list.filter((t) => t.projectId === sel.id);
    } else if (sel.kind === 'goal') {
      const ids = new Set(this.projects().filter((p) => p.goalId === sel.id).map((p) => p.id));
      list = list.filter((t) => t.projectId !== null && ids.has(t.projectId));
    }

    if (f.statuses.length) list = list.filter((t) => f.statuses.includes(t.status));
    if (f.projectId) list = list.filter((t) => t.projectId === f.projectId);
    if (f.goalId) {
      const ids = new Set(this.projects().filter((p) => p.goalId === f.goalId).map((p) => p.id));
      list = list.filter((t) => t.projectId !== null && ids.has(t.projectId));
    }
    if (f.tags.length) list = list.filter((t) => f.tags.some((x) => t.tags.includes(x)));
    if (f.dueFrom) list = list.filter((t) => t.dueDate !== null && t.dueDate >= f.dueFrom!);
    if (f.dueTo) list = list.filter((t) => t.dueDate !== null && t.dueDate <= f.dueTo!);
    if (f.spentMin != null) list = list.filter((t) => (t.spentMinutes ?? 0) >= f.spentMin!);
    if (f.spentMax != null) list = list.filter((t) => (t.spentMinutes ?? 0) <= f.spentMax!);

    if (query) {
      list = list.filter((t) =>
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query),
      );
    }

    return [...list].sort(sortTasks);
  });

  readonly activeFiltersCount = computed(() => {
    const f = this.filters();
    let n = 0;
    if (f.statuses.length) n++;
    if (f.projectId) n++;
    if (f.goalId) n++;
    if (f.tags.length) n++;
    if (f.dueFrom || f.dueTo) n++;
    if (f.spentMin != null || f.spentMax != null) n++;
    return n;
  });

  readonly contextTitle = computed(() => {
    const sel = this.selection();
    if (sel.kind === 'preset') {
      const labels: Record<PresetId, string> = {
        inbox: 'Inbox',
        today: 'Сегодня',
        overdue: 'Просрочено',
        in_progress: 'В работе',
        done: 'Выполнено',
        spent_gt_4h: 'Потрачено > 4 ч',
        no_time: 'Без времени',
      };
      return labels[sel.id];
    }
    if (sel.kind === 'goal') {
      return this.goals().find((g) => g.id === sel.id)?.title ?? 'Цель';
    }
    if (sel.kind === 'project') {
      return this.projects().find((p) => p.id === sel.id)?.title ?? 'Проект';
    }
    return '';
  });

  readonly contextProgress = computed(() => {
    const sel = this.selection();
    if (sel.kind === 'goal') return this.goals().find((g) => g.id === sel.id)?.progress ?? null;
    if (sel.kind === 'project') return this.projects().find((p) => p.id === sel.id)?.progress ?? null;
    return null;
  });

  readonly contextBreadcrumb = computed(() => {
    const sel = this.selection();
    if (sel.kind === 'project') {
      const p = this.projects().find((x) => x.id === sel.id);
      if (!p) return [];
      const g = this.goals().find((x) => x.id === p.goalId);
      return g ? [g.title, p.title] : [p.title];
    }
    if (sel.kind === 'goal') {
      const g = this.goals().find((x) => x.id === sel.id);
      return g ? [g.title] : [];
    }
    return [];
  });

  // --- Load ---
  async loadAll(): Promise<void> {
    try {
      const [goals, projects, tasks, tags, active] = await Promise.all([
        firstValueFrom(this.api.listGoals()),
        firstValueFrom(this.api.listProjects()),
        firstValueFrom(this.api.listTasks()),
        firstValueFrom(this.api.listTags()),
        firstValueFrom(this.api.getActiveTimer()),
      ]);
      this.goals.set(goals);
      this.projects.set(projects);
      this.tasks.set(tasks);
      this.tags.set(tags);
      this.activeTimer.set(active);
    } catch (err) {
      console.error(err);
      this.toast.error('Не удалось загрузить данные');
    }
  }

  // --- Selection ---
  selectPreset(id: PresetId): void {
    this.selection.set({ kind: 'preset', id });
    this.selectedTaskId.set(null);
  }
  selectGoal(id: string): void {
    this.selection.set({ kind: 'goal', id });
    this.selectedTaskId.set(null);
  }
  selectProject(id: string): void {
    this.selection.set({ kind: 'project', id });
    this.selectedTaskId.set(null);
  }

  // --- Modals ---
  openQuickCapture(): void { this.quickCaptureOpen.set(true); }
  closeQuickCapture(): void { this.quickCaptureOpen.set(false); }

  toggleCommandPalette(): void { this.commandPaletteOpen.update((v) => !v); }
  closeCommandPalette(): void { this.commandPaletteOpen.set(false); }

  toggleFilters(): void { this.filtersOpen.update((v) => !v); }
  closeFilters(): void { this.filtersOpen.set(false); }

  openTaskCard(id: string): void { this.editingTaskId.set(id); }
  closeTaskCard(): void { this.editingTaskId.set(null); }

  openGoalForm(id: string | null): void { this.editingGoalId.set(id ?? ''); }
  closeGoalForm(): void { this.editingGoalId.set(null); }

  openProjectForm(id: string | null): void { this.editingProjectId.set(id ?? ''); }
  closeProjectForm(): void { this.editingProjectId.set(null); }

  closeAllModals(): void {
    this.quickCaptureOpen.set(false);
    this.commandPaletteOpen.set(false);
    this.filtersOpen.set(false);
    this.editingTaskId.set(null);
    this.editingGoalId.set(null);
    this.editingProjectId.set(null);
    this.exportOpen.set(false);
  }

  // --- Filters ---
  setFilters(f: Filters): void { this.filters.set(f); }
  resetFilters(): void { this.filters.set({ ...EMPTY_FILTERS }); }
  setSearch(q: string): void { this.searchQuery.set(q); }

  // --- Task CRUD ---
  async createTask(input: Partial<Task>): Promise<Task | null> {
    try {
      const task = await firstValueFrom(this.api.createTask(input));
      this.tasks.update((list) => [...list, task]);
      this.toast.success('Задача создана');
      await this.refreshProgress();
      return task;
    } catch (err) {
      console.error(err);
      this.toast.error('Не удалось создать задачу');
      return null;
    }
  }

  async updateTask(id: string, patch: Partial<Task>): Promise<void> {
    try {
      const task = await firstValueFrom(this.api.updateTask(id, patch));
      this.tasks.update((list) => list.map((t) => (t.id === id ? task : t)));
      await this.refreshProgress();
    } catch (err) {
      console.error(err);
      this.toast.error('Не удалось сохранить задачу');
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      await firstValueFrom(this.api.deleteTask(id));
      this.tasks.update((list) => list.filter((t) => t.id !== id));
      this.closeTaskCard();
      this.toast.success('Задача удалена');
      await this.refreshProgress();
    } catch (err) {
      console.error(err);
      this.toast.error('Не удалось удалить задачу');
    }
  }

  // --- Goal CRUD ---
  async createGoal(input: Partial<Goal>): Promise<void> {
    try {
      await firstValueFrom(this.api.createGoal(input));
      await this.refreshGoals();
      this.toast.success('Цель создана');
    } catch (err) {
      console.error(err);
      this.toast.error('Не удалось создать цель');
    }
  }

  async updateGoal(id: string, patch: Partial<Goal>): Promise<void> {
    try {
      await firstValueFrom(this.api.updateGoal(id, patch));
      await this.refreshGoals();
    } catch (err) {
      console.error(err);
      this.toast.error('Не удалось сохранить цель');
    }
  }

  async deleteGoal(id: string): Promise<void> {
    try {
      await firstValueFrom(this.api.deleteGoal(id));
      await this.loadAll();
      if (this.selection().kind === 'goal' && (this.selection() as any).id === id) {
        this.selectPreset('inbox');
      }
      this.toast.success('Цель удалена');
    } catch (err) {
      console.error(err);
      this.toast.error('Не удалось удалить цель');
    }
  }

  // --- Project CRUD ---
  async createProject(input: Partial<Project>): Promise<void> {
    try {
      await firstValueFrom(this.api.createProject(input));
      await this.refreshProjects();
      this.toast.success('Проект создан');
    } catch (err) {
      console.error(err);
      this.toast.error('Не удалось создать проект');
    }
  }

  async updateProject(id: string, patch: Partial<Project>): Promise<void> {
    try {
      await firstValueFrom(this.api.updateProject(id, patch));
      await this.refreshProjects();
    } catch (err) {
      console.error(err);
      this.toast.error('Не удалось сохранить проект');
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      await firstValueFrom(this.api.deleteProject(id));
      await this.loadAll();
      if (this.selection().kind === 'project' && (this.selection() as any).id === id) {
        this.selectPreset('inbox');
      }
      this.toast.success('Проект удалён');
    } catch (err) {
      console.error(err);
      this.toast.error('Не удалось удалить проект');
    }
  }

  // --- Timer ---
  async toggleTimer(taskId: string): Promise<void> {
    const task = this.tasks().find((t) => t.id === taskId);
    if (!task) return;
    try {
      if (task.activeTimer) {
        await firstValueFrom(this.api.stopTimer(taskId));
      } else {
        await firstValueFrom(this.api.startTimer(taskId));
      }
      await this.reloadTasksAndTimer();
    } catch (err) {
      console.error(err);
      this.toast.error('Ошибка таймера');
    }
  }

  async addManualTime(taskId: string, minutes: number, date: string): Promise<void> {
    try {
      await firstValueFrom(this.api.addManualTime(taskId, minutes, date));
      await this.reloadTasksAndTimer();
      this.toast.success('Время добавлено');
    } catch (err) {
      console.error(err);
      this.toast.error('Не удалось добавить время');
    }
  }

  async stopActiveTimer(): Promise<void> {
    const active = this.activeTimer();
    if (!active) return;
    await this.toggleTimer(active.taskId);
  }

  // --- Tags ---
  async refreshTags(): Promise<void> {
    try {
      const tags = await firstValueFrom(this.api.listTags());
      this.tags.set(tags);
    } catch { /* ignore */ }
  }

  // --- Export/Import ---
  async exportData(): Promise<void> {
    try {
      const data = await firstValueFrom(this.api.exportAll());
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `goalflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      this.toast.success('Экспорт готов');
    } catch (err) {
      console.error(err);
      this.toast.error('Не удалось экспортировать');
    }
  }

  async importData(file: File): Promise<void> {
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      await firstValueFrom(this.api.importAll(payload));
      await this.loadAll();
      this.toast.success('Импорт завершён');
    } catch (err) {
      console.error(err);
      this.toast.error('Ошибка импорта');
    }
  }

  // --- Internal refresh ---
  private async refreshGoals(): Promise<void> {
    const goals = await firstValueFrom(this.api.listGoals());
    this.goals.set(goals);
  }
  private async refreshProjects(): Promise<void> {
    const [projects, goals] = await Promise.all([
      firstValueFrom(this.api.listProjects()),
      firstValueFrom(this.api.listGoals()),
    ]);
    this.projects.set(projects);
    this.goals.set(goals);
  }
  private async refreshProgress(): Promise<void> {
    const [goals, projects] = await Promise.all([
      firstValueFrom(this.api.listGoals()),
      firstValueFrom(this.api.listProjects()),
    ]);
    this.goals.set(goals);
    this.projects.set(projects);
  }
  private async reloadTasksAndTimer(): Promise<void> {
    const [tasks, active, tags] = await Promise.all([
      firstValueFrom(this.api.listTasks()),
      firstValueFrom(this.api.getActiveTimer()),
      firstValueFrom(this.api.listTags()),
    ]);
    this.tasks.set(tasks);
    this.activeTimer.set(active);
    this.tags.set(tags);
    await this.refreshProgress();
  }
}

function sortTasks(a: Task, b: Task): number {
  const order: Record<TaskStatus, number> = { doing: 0, todo: 1, done: 2, cancelled: 3 };
  const d = order[a.status] - order[b.status];
  if (d !== 0) return d;
  const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
  const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
  if (da !== db) return da - db;
  return a.title.localeCompare(b.title);
}
```

---

## Shared

### `client/src/app/shared/toast.component.ts`

```typescript
import { Component, inject } from '@angular/core';
import { ToastService } from '../core/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="toast-host">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast" [class.success]="t.type === 'success'"
                          [class.warning]="t.type === 'warning'"
                          [class.error]="t.type === 'error'"
                          (click)="toast.dismiss(t.id)">
          {{ t.message }}
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-host {
      position: fixed; bottom: 20px; right: 20px;
      display: flex; flex-direction: column; gap: 8px;
      z-index: 3000;
    }
    .toast {
      background: #222; color: #fff;
      padding: 10px 14px; border-radius: 6px;
      font-size: 13px; max-width: 320px;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,.15);
    }
    .toast.success { background: var(--success); }
    .toast.warning { background: var(--warning); }
    .toast.error { background: var(--danger); }
  `],
})
export class ToastComponent {
  toast = inject(ToastService);
}
```

---

## Features

### `client/src/app/features/sidebar.component.ts`

```typescript
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../core/state.service';
import { PRESETS, type PresetId } from '../core/models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="sidebar">
      <div class="brand">
        <span class="logo">◆</span>
        <span class="name">GoalFlow</span>
      </div>

      <div class="section">
        @for (p of presets; track p.id) {
          <button class="item"
                  [class.active]="isPresetActive(p.id)"
                  (click)="state.selectPreset(p.id)">
            {{ p.label }}
          </button>
        }
      </div>

      <div class="section-header">
        <span>Цели</span>
        <button class="add" (click)="state.openGoalForm(null)" title="Новая цель">+</button>
      </div>

      <div class="section tree">
        @for (g of state.goals(); track g.id) {
          <div class="goal">
            <button class="item goal-item"
                    [class.active]="isGoalActive(g.id)"
                    (click)="state.selectGoal(g.id)">
              <span class="dot" [class.archived]="g.status === 'archived'"></span>
              <span class="label">{{ g.title }}</span>
              @if (g.progress) {
                <span class="progress-mini">{{ g.progress.percent }}%</span>
              }
              <span class="edit" (click)="editGoal($event, g.id)" title="Редактировать">✎</span>
            </button>

            @for (p of projectsOf(g.id); track p.id) {
              <button class="item project-item"
                      [class.active]="isProjectActive(p.id)"
                      (click)="state.selectProject(p.id)">
                <span class="label">{{ p.title }}</span>
                @if (p.progress) {
                  <span class="progress-mini">{{ p.progress.percent }}%</span>
                }
                <span class="edit" (click)="editProject($event, p.id)" title="Редактировать">✎</span>
              </button>
            }
            <button class="item add-project" (click)="state.openProjectForm(null)">
              + проект
            </button>
          </div>
        }
        @if (state.goals().length === 0) {
          <div class="empty">Нет целей</div>
        }
      </div>

      <div class="footer">
        <button class="item" (click)="state.exportData()">Экспорт</button>
        <label class="item import">
          Импорт
          <input type="file" accept="application/json" (change)="onImport($event)" hidden />
        </label>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-width);
      height: 100vh;
      border-right: 1px solid var(--border);
      display: flex; flex-direction: column;
      background: #fafafa;
      flex-shrink: 0;
    }
    .brand {
      padding: 16px;
      display: flex; align-items: center; gap: 8px;
      font-weight: 600;
      font-size: 15px;
    }
    .logo { color: var(--accent); }
    .section { padding: 4px 8px; }
    .section-header {
      padding: 12px 16px 6px;
      display: flex; justify-content: space-between; align-items: center;
      font-size: 11px; text-transform: uppercase; letter-spacing: .06em;
      color: var(--text-muted);
    }
    .add {
      width: 20px; height: 20px; border-radius: 4px;
      color: var(--text-muted); font-size: 16px; line-height: 1;
    }
    .add:hover { background: var(--bg-hover); color: #000; }
    .tree { flex: 1; overflow-y: auto; padding-bottom: 8px; }
    .item {
      display: flex; align-items: center; gap: 6px;
      width: 100%;
      padding: 6px 10px;
      border-radius: 6px;
      text-align: left;
      color: #333;
      font-size: 13px;
      position: relative;
    }
    .item:hover { background: var(--bg-hover); }
    .item.active { background: var(--bg-active); color: var(--accent); font-weight: 500; }
    .label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .progress-mini { font-size: 11px; color: var(--text-muted); }
    .dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--accent);
      flex-shrink: 0;
    }
    .dot.archived { background: #bbb; }
    .goal-item { padding-left: 10px; }
    .project-item { padding-left: 26px; font-size: 12.5px; color: var(--text-soft); }
    .add-project {
      padding-left: 26px;
      font-size: 12px;
      color: var(--text-muted);
    }
    .edit {
      opacity: 0; font-size: 12px; color: var(--text-muted);
      padding: 0 2px;
    }
    .item:hover .edit { opacity: 1; }
    .empty { padding: 12px 16px; color: var(--text-muted); font-size: 12px; }
    .footer {
      border-top: 1px solid var(--border);
      padding: 8px;
      display: flex; flex-direction: column; gap: 2px;
    }
    .import { cursor: pointer; }
  `],
})
export class SidebarComponent {
  state = inject(StateService);
  presets = PRESETS;

  isPresetActive(id: PresetId): boolean {
    const s = this.state.selection();
    return s.kind === 'preset' && s.id === id;
  }
  isGoalActive(id: string): boolean {
    const s = this.state.selection();
    return s.kind === 'goal' && s.id === id;
  }
  isProjectActive(id: string): boolean {
    const s = this.state.selection();
    return s.kind === 'project' && s.id === id;
  }
  projectsOf(goalId: string) {
    return this.state.projects().filter((p) => p.goalId === goalId);
  }
  editGoal(e: Event, id: string): void {
    e.stopPropagation();
    this.state.openGoalForm(id);
  }
  editProject(e: Event, id: string): void {
    e.stopPropagation();
    this.state.openProjectForm(id);
  }
  onImport(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.state.importData(file);
    input.value = '';
  }
}
```

---

### `client/src/app/features/top-bar.component.ts`

```typescript
import { Component, ElementRef, effect, inject, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../core/state.service';
import { fmtMinutes } from '../core/format';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="top-bar">
      <div class="search-wrap">
        <span class="search-icon">⌕</span>
        <input #searchInput
               class="search"
               placeholder="Поиск…  ( / )"
               [ngModel]="state.searchQuery()"
               (ngModelChange)="state.setSearch($event)" />
      </div>

      <button class="chip" [class.active]="state.activeFiltersCount() > 0"
              (click)="state.toggleFilters()">
        Фильтры
        @if (state.activeFiltersCount() > 0) {
          <span class="badge">{{ state.activeFiltersCount() }}</span>
        }
      </button>

      @if (state.activeTimer(); as active) {
        <button class="timer-chip" (click)="state.openTaskCard(active.taskId)">
          <span class="pulse"></span>
          {{ taskTitle(active.taskId) }}
          <span class="timer-time">{{ elapsed(active.startTime) }}</span>
          <span class="timer-stop" (click)="stop($event)">■</span>
        </button>
      }

      <div class="spacer"></div>

      <button class="cmd-hint" (click)="state.toggleCommandPalette()">
        <span>⌘K</span>
      </button>

      <button class="primary" (click)="state.openQuickCapture()">
        + Задача
      </button>
    </header>
  `,
  styles: [`
    .top-bar {
      height: 52px;
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center;
      gap: 8px;
      padding: 0 16px;
      background: #fff;
    }
    .search-wrap {
      position: relative;
      flex: 1; max-width: 420px;
    }
    .search-icon {
      position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
      color: var(--text-muted); font-size: 14px;
    }
    .search {
      width: 100%;
      padding: 7px 10px 7px 28px;
      border: 1px solid var(--border);
      border-radius: 6px;
      outline: none;
      background: #fafafa;
    }
    .search:focus { background: #fff; border-color: var(--border-strong); }
    .chip {
      padding: 6px 12px;
      border-radius: 6px;
      border: 1px solid var(--border);
      font-size: 12.5px;
      color: var(--text-soft);
      display: flex; align-items: center; gap: 6px;
    }
    .chip:hover { background: var(--bg-hover); }
    .chip.active { border-color: var(--accent); color: var(--accent); }
    .badge {
      background: var(--accent); color: #fff;
      border-radius: 10px; padding: 0 6px; font-size: 10px;
      line-height: 16px;
    }
    .timer-chip {
      display: flex; align-items: center; gap: 8px;
      padding: 6px 10px;
      border-radius: 6px;
      background: #fff7ed; color: #9a3412;
      font-size: 12.5px;
      border: 1px solid #fed7aa;
    }
    .timer-chip:hover { background: #ffedd5; }
    .pulse {
      width: 8px; height: 8px; border-radius: 50%;
      background: #f97316;
      animation: pulse 1.4s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: .4; }
    }
    .timer-time { font-variant-numeric: tabular-nums; color: #c2410c; }
    .timer-stop {
      padding: 0 6px; border-left: 1px solid #fed7aa;
      margin-left: 4px;
    }
    .spacer { flex: 1; }
    .cmd-hint {
      padding: 6px 10px;
      border-radius: 6px;
      border: 1px solid var(--border);
      font-size: 12px; color: var(--text-muted);
      font-family: ui-monospace, monospace;
    }
    .cmd-hint:hover { background: var(--bg-hover); }
    .primary {
      padding: 7px 14px;
      background: var(--accent); color: #fff;
      border-radius: 6px; font-size: 13px;
      font-weight: 500;
    }
    .primary:hover { background: var(--accent-hover); }
  `],
})
export class TopBarComponent {
  state = inject(StateService);
  searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  constructor() {
    effect(() => {
      this.state.focusSearchTick();
      queueMicrotask(() => this.searchInput()?.nativeElement.focus());
    });

    // Тикер для обновления таймера
    setInterval(() => {
      // триггерим change detection через state
      const t = this.state.activeTimer();
      if (t) this.state.activeTimer.set({ ...t });
    }, 1000);
  }

  taskTitle(taskId: string): string {
    return this.state.tasks().find((t) => t.id === taskId)?.title ?? '…';
  }

  elapsed(startIso: string): string {
    const ms = Date.now() - new Date(startIso).getTime();
    const min = Math.max(0, Math.floor(ms / 60000));
    return fmtMinutes(min);
  }

  stop(e: Event): void {
    e.stopPropagation();
    this.state.stopActiveTimer();
  }
}
```

---

### `client/src/app/features/task-list.component.ts`

```typescript
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../core/state.service';
import { TaskRowComponent } from './task-row.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, TaskRowComponent],
  template: `
    <section class="task-list-wrap">
      <header class="list-header">
        <div class="crumbs">
          @for (c of state.contextBreadcrumb(); track c; let last = $last) {
            <span class="crumb" [class.last]="last">{{ c }}</span>
            @if (!last) { <span class="sep">/</span> }
          }
          @if (state.contextBreadcrumb().length === 0) {
            <span class="crumb last">{{ state.contextTitle() }}</span>
          }
        </div>

        @if (state.contextProgress(); as p) {
          <div class="progress">
            <div class="bar"><div class="fill" [style.width.%]="p.percent"></div></div>
            <span class="pct">{{ p.done }} / {{ p.total }}</span>
          </div>
        }

        <div class="count">{{ state.visibleTasks().length }} задач</div>
      </header>

      <div class="rows">
        @for (t of state.visibleTasks(); track t.id) {
          <app-task-row [task]="t"></app-task-row>
        }
        @if (state.visibleTasks().length === 0) {
          <div class="empty">
            <div class="empty-icon">◇</div>
            <div class="empty-title">Задач нет</div>
            <button class="empty-btn" (click)="state.openQuickCapture()">+ Новая задача</button>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .task-list-wrap {
      flex: 1;
      overflow-y: auto;
      padding: 16px 20px 40px;
    }
    .list-header {
      display: flex; align-items: center; gap: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 12px;
    }
    .crumbs { display: flex; align-items: center; gap: 6px; font-size: 14px; }
    .crumb { color: var(--text-muted); }
    .crumb.last { color: #000; font-weight: 600; }
    .sep { color: var(--border-strong); }
    .progress { display: flex; align-items: center; gap: 8px; margin-left: auto; }
    .bar {
      width: 120px; height: 4px;
      background: #eee; border-radius: 2px;
      overflow: hidden;
    }
    .fill { height: 100%; background: var(--accent); transition: width .2s; }
    .pct { font-size: 11px; color: var(--text-muted); }
    .count {
      font-size: 12px; color: var(--text-muted);
      margin-left: auto;
    }
    .rows { display: flex; flex-direction: column; gap: 2px; }
    .empty {
      text-align: center;
      padding: 80px 20px;
      color: var(--text-muted);
    }
    .empty-icon { font-size: 40px; opacity: .3; margin-bottom: 8px; }
    .empty-title { font-size: 15px; margin-bottom: 12px; }
    .empty-btn {
      padding: 6px 14px;
      border: 1px solid var(--border);
      border-radius: 6px;
      font-size: 13px;
    }
    .empty-btn:hover { background: var(--bg-hover); }
  `],
})
export class TaskListComponent {
  state = inject(StateService);
}
```

---

### `client/src/app/features/task-row.component.ts`

```typescript
import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../core/state.service';
import { fmtDate, fmtMinutes, isPast } from '../core/format';
import type { Task } from '../core/models';

@Component({
  selector: 'app-task-row',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="row"
         [class.selected]="state.selectedTaskId() === task().id"
         [class.done]="task().status === 'done'"
         (click)="select()">

      <button class="check" [class.checked]="task().status === 'done'"
              (click)="toggleDone($event)">
        @if (task().status === 'done') { ✓ }
      </button>

      <div class="content" (dblclick)="open()">
        <div class="title">{{ task().title }}</div>
        @if (task().description) {
          <div class="desc">{{ task().description }}</div>
        }
      </div>

      @if (task().status === 'doing') { <span class="badge doing">в работе</span> }
      @if (task().priority; as p) { <span class="badge prio-{{p}}">{{ prioLabel(p) }}</span> }

      @for (tag of task().tags; track tag) {
        <span class="tag">{{ tag }}</span>
      }

      @if (task().dueDate; as d) {
        <span class="due" [class.over]="isPast(d) && task().status !== 'done'">
          {{ fmtDate(d) }}
        </span>
      }

      @if ((task().spentMinutes ?? 0) > 0) {
        <span class="spent">{{ fmtMinutes(task().spentMinutes) }}</span>
      }

      <button class="timer"
              [class.active]="task().activeTimer"
              (click)="toggleTimer($event)"
              [title]="task().activeTimer ? 'Стоп' : 'Старт'">
        @if (task().activeTimer) { ■ } @else { ▶ }
      </button>
    </div>
  `,
  styles: [`
    .row {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 10px;
      border-radius: 6px;
      cursor: pointer;
      min-height: 38px;
      border: 1px solid transparent;
    }
    .row:hover { background: var(--bg-hover); }
    .row.selected { background: var(--bg-active); border-color: #c7dbff; }
    .row.done .title { color: var(--text-muted); text-decoration: line-through; }
    .check {
      width: 18px; height: 18px;
      border: 1.5px solid var(--border-strong);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 10px; color: #fff;
      flex-shrink: 0;
    }
    .check:hover { border-color: var(--accent); }
    .check.checked { background: var(--success); border-color: var(--success); }
    .content { flex: 1; min-width: 0; }
    .title {
      font-size: 13.5px; color: #222;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .desc {
      font-size: 11.5px; color: var(--text-muted);
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      margin-top: 1px;
    }
    .badge {
      font-size: 10.5px; padding: 1px 6px; border-radius: 4px;
      text-transform: lowercase;
    }
    .badge.doing { background: #dbeafe; color: #1e40af; }
    .badge.prio-low { background: #f3f4f6; color: #4b5563; }
    .badge.prio-medium { background: #fef3c7; color: #92400e; }
    .badge.prio-high { background: #fee2e2; color: #991b1b; }
    .tag {
      font-size: 11px; padding: 1px 6px;
      background: #f3f4f6; color: var(--text-soft);
      border-radius: 4px;
    }
    .due {
      font-size: 11.5px; color: var(--text-muted);
      font-variant-numeric: tabular-nums;
    }
    .due.over { color: var(--danger); font-weight: 500; }
    .spent {
      font-size: 11.5px; color: var(--text-muted);
      font-variant-numeric: tabular-nums;
      min-width: 44px; text-align: right;
    }
    .timer {
      width: 26px; height: 26px;
      border-radius: 4px;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; color: var(--text-muted);
      flex-shrink: 0;
    }
    .timer:hover { background: #fff; color: var(--accent); }
    .timer.active { color: #f97316; background: #fff7ed; }
  `],
})
export class TaskRowComponent {
  state = inject(StateService);
  task = input.required<Task>();

  fmtDate = fmtDate;
  fmtMinutes = fmtMinutes;
  isPast = isPast;

  prioLabel(p: string): string {
    return p === 'low' ? 'низ' : p === 'medium' ? 'сред' : 'выс';
  }

  select(): void {
    this.state.selectedTaskId.set(this.task().id);
  }

  open(): void {
    this.state.openTaskCard(this.task().id);
  }

  toggleDone(e: Event): void {
    e.stopPropagation();
    const t = this.task();
    const next = t.status === 'done' ? 'todo' : 'done';
    this.state.updateTask(t.id, { status: next });
  }

  toggleTimer(e: Event): void {
    e.stopPropagation();
    this.state.toggleTimer(this.task().id);
  }
}
```

---

### `client/src/app/features/task-card.component.ts`

```typescript
import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../core/state.service';
import { fmtMinutes, toDateInputValue } from '../core/format';
import type { Priority, Task, TaskStatus } from '../core/models';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../core/api.service';
import type { TaskTimeInfo } from '../core/models';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (task(); as t) {
      <div class="backdrop" (click)="close()"></div>
      <div class="card" (click)="$event.stopPropagation()">
        <header class="head">
          <input class="title-input"
                 [ngModel]="title"
                 (ngModelChange)="title = $event"
                 (blur)="saveTitle()"
                 (keydown.enter)="saveTitle(); $event.preventDefault()" />
          <button class="close" (click)="close()">✕</button>
        </header>

        <div class="meta">
          <label>
            <span>Статус</span>
            <select [ngModel]="t.status" (ngModelChange)="setStatus($event)">
              <option value="todo">Todo</option>
              <option value="doing">В работе</option>
              <option value="done">Выполнено</option>
              <option value="cancelled">Отменено</option>
            </select>
          </label>

          <label>
            <span>Проект</span>
            <select [ngModel]="t.projectId ?? ''" (ngModelChange)="setProject($event)">
              <option value="">— Inbox —</option>
              @for (p of state.projects(); track p.id) {
                <option [value]="p.id">{{ p.title }}</option>
              }
            </select>
          </label>

          <label>
            <span>Приоритет</span>
            <select [ngModel]="t.priority ?? ''" (ngModelChange)="setPriority($event)">
              <option value="">—</option>
              <option value="low">Низкий</option>
              <option value="medium">Средний</option>
              <option value="high">Высокий</option>
            </select>
          </label>

          <label>
            <span>Дедлайн</span>
            <input type="date"
                   [ngModel]="toDateInputValue(t.dueDate)"
                   (ngModelChange)="setDue($event)" />
          </label>

          <label>
            <span>Оценка, мин</span>
            <input type="number" min="0"
                   [ngModel]="t.estimateMinutes ?? ''"
                   (ngModelChange)="setEstimate($event)" />
          </label>
        </div>

        <label class="block">
          <span class="lbl">Описание</span>
          <textarea [ngModel]="t.description"
                    (ngModelChange)="desc = $event"
                    (blur)="saveDesc()"
                    rows="3"
                    placeholder="Добавить детали…"></textarea>
        </label>

        <label class="block">
          <span class="lbl">Теги</span>
          <div class="tags-edit">
            @for (tag of t.tags; track tag) {
              <span class="tag">
                {{ tag }}
                <span class="x" (click)="removeTag(tag)">✕</span>
              </span>
            }
            <input class="tag-input"
                   placeholder="+ тег"
                   [(ngModel)]="tagInput"
                   (keydown.enter)="addTag(); $event.preventDefault()"
                   list="tag-suggestions" />
            <datalist id="tag-suggestions">
              @for (s of state.tags(); track s) { <option [value]="s"></option> }
            </datalist>
          </div>
        </label>

        <div class="time-section">
          <div class="time-head">
            <span class="lbl">Время</span>
            <span class="time-total">
              Всего: <b>{{ fmtMinutes(timeInfo()?.total) }}</b>
              · Сегодня: <b>{{ fmtMinutes(timeInfo()?.today) }}</b>
            </span>
          </div>

          <div class="time-actions">
            <button class="btn" (click)="state.toggleTimer(t.id)">
              @if (t.activeTimer) { ■ Стоп } @else { ▶ Старт }
            </button>
            <input class="manual-input" type="number" min="1" max="480"
                   placeholder="мин" [(ngModel)]="manualMinutes" />
            <input class="manual-date" type="date" [(ngModel)]="manualDate" />
            <button class="btn" (click)="addManual()" [disabled]="!manualMinutes">+ Время</button>
          </div>

          @if (timeInfo()?.entries?.length) {
            <div class="entries">
              @for (e of timeInfo()!.entries; track e.id) {
                <div class="entry">
                  <span>{{ fmtDateTime(e.startTime) }}</span>
                  <span>{{ fmtMinutes(e.durationMinutes) }}</span>
                  <span class="src">{{ e.source === 'manual' ? 'вручную' : 'таймер' }}</span>
                  @if (e.truncated) { <span class="trunc">обрезано до 8 ч</span> }
                </div>
              }
            </div>
          }
        </div>

        <footer class="foot">
          <button class="danger" (click)="remove()">Удалить</button>
          <div class="spacer"></div>
          <button class="ghost" (click)="close()">Закрыть</button>
        </footer>
      </div>
    }
  `,
  styles: [`
    .backdrop {
      position: fixed; inset: 0;
      background: rgba(0,0,0,.25);
      z-index: 1000;
    }
    .card {
      position: fixed;
      top: 8vh; left: 50%; transform: translateX(-50%);
      width: min(640px, 92vw);
      max-height: 84vh;
      overflow-y: auto;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,.25);
      z-index: 1001;
      padding: 20px;
    }
    .head { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
    .title-input {
      flex: 1;
      border: none; outline: none;
      font-size: 18px; font-weight: 600;
      padding: 4px 0;
    }
    .close {
      width: 28px; height: 28px; border-radius: 6px;
      color: var(--text-muted);
    }
    .close:hover { background: var(--bg-hover); color: #000; }
    .meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px 16px;
      margin-bottom: 14px;
    }
    .meta label, .block { display: flex; flex-direction: column; gap: 4px; font-size: 12px; }
    .meta span, .lbl { color: var(--text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: .04em; }
    select, input[type=date], input[type=number], textarea, .tag-input {
      padding: 6px 8px;
      border: 1px solid var(--border);
      border-radius: 6px;
      outline: none;
      background: #fff;
      font-size: 13px;
    }
    select:focus, input:focus, textarea:focus { border-color: var(--accent); }
    textarea { resize: vertical; font-family: inherit; }
    .block { margin-bottom: 14px; }
    .tags-edit {
      display: flex; flex-wrap: wrap; gap: 4px;
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 4px;
    }
    .tag {
      display: inline-flex; align-items: center; gap: 4px;
      background: #eef2ff; color: #3730a3;
      padding: 2px 8px; border-radius: 4px;
      font-size: 12px;
    }
    .tag .x { cursor: pointer; opacity: .6; font-size: 10px; }
    .tag .x:hover { opacity: 1; }
    .tag-input { border: none; flex: 1; min-width: 80px; padding: 4px; }
    .time-section {
      border-top: 1px solid var(--border);
      padding-top: 14px;
      margin-top: 4px;
    }
    .time-head {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 8px;
    }
    .time-total { font-size: 12px; color: var(--text-soft); }
    .time-total b { color: #000; }
    .time-actions {
      display: flex; gap: 6px; align-items: center;
      flex-wrap: wrap;
      margin-bottom: 12px;
    }
    .btn {
      padding: 6px 12px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: #fff;
      font-size: 12.5px;
    }
    .btn:hover { background: var(--bg-hover); }
    .btn:disabled { opacity: .4; cursor: not-allowed; }
    .manual-input { width: 60px; padding: 5px 8px; border: 1px solid var(--border); border-radius: 6px; }
    .manual-date { padding: 5px 8px; border: 1px solid var(--border); border-radius: 6px; }
    .entries { display: flex; flex-direction: column; gap: 3px; }
    .entry {
      display: flex; gap: 12px; align-items: center;
      font-size: 12px; color: var(--text-soft);
      padding: 4px 6px;
      border-radius: 4px;
    }
    .entry:hover { background: var(--bg-hover); }
    .src { color: var(--text-muted); font-size: 11px; }
    .trunc { color: var(--warning); font-size: 11px; }
    .foot {
      display: flex; align-items: center;
      border-top: 1px solid var(--border);
      padding-top: 14px;
      margin-top: 16px;
    }
    .spacer { flex: 1; }
    .danger {
      padding: 6px 12px;
      border-radius: 6px;
      color: var(--danger);
      font-size: 12.5px;
    }
    .danger:hover { background: #fef2f2; }
    .ghost {
      padding: 6px 14px;
      border: 1px solid var(--border);
      border-radius: 6px;
      font-size: 13px;
    }
    .ghost:hover { background: var(--bg-hover); }
  `],
})
export class TaskCardComponent {
  state = inject(StateService);
  api = inject(ApiService);
  taskId = input.required<string>();

  task = computed(() => this.state.tasks().find((t) => t.id === this.taskId()) ?? null);
  timeInfo = computed(() => this.timeCache);

  title = '';
  desc = '';
  tagInput = '';
  manualMinutes: number | null = null;
  manualDate = new Date().toISOString().slice(0, 10);

  private timeCache: TaskTimeInfo | null = null;

  toDateInputValue = toDateInputValue;
  fmtMinutes = fmtMinutes;
  fmtDateTime = (s: string) => new Date(s).toLocaleString('ru-RU', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });

  constructor() {
    // init fields
    queueMicrotask(() => {
      const t = this.task();
      if (t) { this.title = t.title; this.desc = t.description; }
      this.loadTime();
    });
  }

  private async loadTime(): Promise<void> {
    try {
      this.timeCache = await firstValueFrom(this.api.getTaskTime(this.taskId()));
      // trigger recompute
      this.state.tasks.update((list) => [...list]);
    } catch { /* ignore */ }
  }

  close(): void { this.state.closeTaskCard(); }

  saveTitle(): void {
    const t = this.task();
    if (!t || !this.title.trim() || this.title === t.title) return;
    this.state.updateTask(t.id, { title: this.title.trim() });
  }
  saveDesc(): void {
    const t = this.task();
    if (!t || this.desc === t.description) return;
    this.state.updateTask(t.id, { description: this.desc });
  }

  setStatus(s: TaskStatus): void {
    const t = this.task(); if (!t) return;
    this.state.updateTask(t.id, { status: s });
  }
  setProject(id: string): void {
    const t = this.task(); if (!t) return;
    this.state.updateTask(t.id, { projectId: id || null });
  }
  setPriority(p: string): void {
    const t = this.task(); if (!t) return;
    this.state.updateTask(t.id, { priority: (p || null) as Priority | null });
  }
  setDue(d: string): void {
    const t = this.task(); if (!t) return;
    this.state.updateTask(t.id, { dueDate: d ? new Date(d + 'T00:00:00').toISOString() : null });
  }
  setEstimate(v: string | number): void {
    const t = this.task(); if (!t) return;
    const n = v === '' || v === null ? null : Number(v);
    this.state.updateTask(t.id, { estimateMinutes: n });
  }

  addTag(): void {
    const t = this.task(); if (!t) return;
    const tag = this.tagInput.trim();
    if (!tag || t.tags.includes(tag)) { this.tagInput = ''; return; }
    this.state.updateTask(t.id, { tags: [...t.tags, tag] });
    this.tagInput = '';
  }
  removeTag(tag: string): void {
    const t = this.task(); if (!t) return;
    this.state.updateTask(t.id, { tags: t.tags.filter((x) => x !== tag) });
  }

  async addManual(): Promise<void> {
    const t = this.task();
    if (!t || !this.manualMinutes) return;
    await this.state.addManualTime(t.id, this.manualMinutes, this.manualDate);
    this.manualMinutes = null;
    await this.loadTime();
  }

  async remove(): Promise<void> {
    const t = this.task(); if (!t) return;
    if (!confirm(`Удалить задачу «${t.title}»?`)) return;
    await this.state.deleteTask(t.id);
  }
}
```

---

### `client/src/app/features/quick-capture.component.ts`

```typescript
import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../core/state.service';

@Component({
  selector: 'app-quick-capture',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="backdrop" (click)="close()"></div>
    <div class="modal" (click)="$event.stopPropagation()">
      <input #titleInput
             class="title"
             placeholder="Что нужно сделать?"
             [(ngModel)]="title"
             (keydown.enter)="save()"
             (keydown.escape)="close()" />

      <div class="controls">
        <label>
          <span>Проект</span>
          <select [(ngModel)]="projectId">
            <option value="">— Inbox —</option>
            @for (p of state.projects(); track p.id) {
              <option [value]="p.id">{{ p.title }}</option>
            }
          </select>
        </label>
        <div class="spacer"></div>
        <span class="hint">Enter — сохранить · Esc — закрыть</span>
        <button class="primary" (click)="save()" [disabled]="!title.trim()">Добавить</button>
      </div>
    </div>
  `,
  styles: [`
    .backdrop {
      position: fixed; inset: 0;
      background: rgba(0,0,0,.25);
      z-index: 1000;
    }
    .modal {
      position: fixed;
      top: 15vh; left: 50%; transform: translateX(-50%);
      width: min(560px, 92vw);
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 20px 60px rgba(0,0,0,.25);
      padding: 16px;
      z-index: 1001;
    }
    .title {
      width: 100%;
      border: none; outline: none;
      font-size: 17px; font-weight: 500;
      padding: 6px 0 12px;
      border-bottom: 1px solid var(--border);
    }
    .controls {
      display: flex; align-items: center; gap: 10px;
      margin-top: 12px;
      font-size: 12.5px;
    }
    .controls label { display: flex; align-items: center; gap: 6px; color: var(--text-muted); }
    select {
      padding: 6px 8px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: #fff;
      font-size: 12.5px;
    }
    .spacer { flex: 1; }
    .hint { color: var(--text-muted); font-size: 11px; }
    .primary {
      padding: 7px 14px;
      background: var(--accent); color: #fff;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
    }
    .primary:disabled { opacity: .4; cursor: not-allowed; }
  `],
})
export class QuickCaptureComponent {
  state = inject(StateService);
  titleInput = viewChild<ElementRef<HTMLInputElement>>('titleInput');

  title = '';
  projectId = '';

  constructor() {
    queueMicrotask(() => this.titleInput()?.nativeElement.focus());
  }

  close(): void { this.state.closeQuickCapture(); }

  async save(): Promise<void> {
    const title = this.title.trim();
    if (!title) return;
    await this.state.createTask({
      title,
      projectId: this.projectId || null,
      tags: [],
    });
    this.close();
  }
}
```

---

### `client/src/app/features/command-palette.component.ts`

```typescript
import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../core/state.service';
import { PRESETS } from '../core/models';

interface Command {
  id: string;
  label: string;
  hint?: string;
  run: () => void;
}

@Component({
  selector: 'app-command-palette',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="backdrop" (click)="close()"></div>
    <div class="palette" (click)="$event.stopPropagation()">
      <input #input
             class="input"
             placeholder="Команда или переход…"
             [(ngModel)]="query"
             (keydown.arrowdown)="move(1); $event.preventDefault()"
             (keydown.arrowup)="move(-1); $event.preventDefault()"
             (keydown.enter)="runSelected()"
             (keydown.escape)="close()" />

      <div class="list">
        @for (c of filtered(); track c.id; let i = $index) {
          <button class="item"
                  [class.active]="i === activeIndex()"
                  (mouseenter)="activeIndex.set(i)"
                  (click)="run(c)">
            <span class="label">{{ c.label }}</span>
            @if (c.hint) { <span class="hint">{{ c.hint }}</span> }
          </button>
        }
        @if (filtered().length === 0) {
          <div class="empty">Ничего не найдено</div>
        }
      </div>
    </div>
  `,
  styles: [`
    .backdrop {
      position: fixed; inset: 0;
      background: rgba(0,0,0,.25);
      z-index: 2000;
    }
    .palette {
      position: fixed;
      top: 15vh; left: 50%; transform: translateX(-50%);
      width: min(560px, 92vw);
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 20px 60px rgba(0,0,0,.3);
      overflow: hidden;
      z-index: 2001;
    }
    .input {
      width: 100%;
      border: none; outline: none;
      padding: 14px 16px;
      font-size: 15px;
      border-bottom: 1px solid var(--border);
    }
    .list { max-height: 50vh; overflow-y: auto; padding: 6px; }
    .item {
      display: flex; align-items: center; gap: 8px;
      width: 100%;
      padding: 8px 10px;
      border-radius: 6px;
      text-align: left;
      font-size: 13px;
    }
    .item.active { background: var(--bg-active); }
    .label { flex: 1; }
    .hint { color: var(--text-muted); font-size: 11px; }
    .empty { padding: 20px; text-align: center; color: var(--text-muted); font-size: 13px; }
  `],
})
export class CommandPaletteComponent {
  state = inject(StateService);
  inputRef = viewChild<ElementRef<HTMLInputElement>>('input');

  query = '';
  activeIndex = signal(0);

  constructor() {
    queueMicrotask(() => this.inputRef()?.nativeElement.focus());
  }

  close(): void { this.state.closeCommandPalette(); }

  private commands(): Command[] {
    const cmds: Command[] = [
      {
        id: 'new-task',
        label: 'Новая задача',
        hint: 'N',
        run: () => this.state.openQuickCapture(),
      },
      {
        id: 'export',
        label: 'Экспорт данных',
        run: () => this.state.exportData(),
      },
    ];

    for (const p of PRESETS) {
      cmds.push({
        id: `preset-${p.id}`,
        label: `Пресет: ${p.label}`,
        run: () => this.state.selectPreset(p.id),
      });
    }
    for (const g of this.state.goals()) {
      cmds.push({
        id: `goal-${g.id}`,
        label: `Цель: ${g.title}`,
        run: () => this.state.selectGoal(g.id),
      });
    }
    for (const p of this.state.projects()) {
      cmds.push({
        id: `project-${p.id}`,
        label: `Проект: ${p.title}`,
        run: () => this.state.selectProject(p.id),
      });
    }
    return cmds;
  }

  filtered(): Command[] {
    const q = this.query.trim().toLowerCase();
    const list = this.commands();
    if (!q) return list;
    return list.filter((c) => c.label.toLowerCase().includes(q));
  }

  move(delta: number): void {
    const len = this.filtered().length;
    if (len === 0) return;
    const next = (this.activeIndex() + delta + len) % len;
    this.activeIndex.set(next);
  }

  runSelected(): void {
    const list = this.filtered();
    const c = list[this.activeIndex()];
    if (c) this.run(c);
  }

  run(c: Command): void {
    this.close();
    setTimeout(() => c.run());
  }
}
```

---

### `client/src/app/features/filters-popover.component.ts`

```typescript
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../core/state.service';
import { EMPTY_FILTERS, type TaskStatus } from '../core/models';

@Component({
  selector: 'app-filters-popover',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="backdrop" (click)="close()"></div>
    <div class="popover" (click)="$event.stopPropagation()">
      <header class="head">
        <span>Фильтры</span>
        <button class="reset" (click)="reset()">Сбросить</button>
      </header>

      <div class="group">
        <div class="glabel">Статус</div>
        <div class="chips">
          @for (s of statuses; track s) {
            <button class="chip"
                    [class.on]="hasStatus(s)"
                    (click)="toggleStatus(s)">
              {{ statusLabel(s) }}
            </button>
          }
        </div>
      </div>

      <div class="group">
        <div class="glabel">Проект</div>
        <select [(ngModel)]="projectId" (ngModelChange)="onChange()">
          <option value="">— любой —</option>
          @for (p of state.projects(); track p.id) {
            <option [value]="p.id">{{ p.title }}</option>
          }
        </select>
      </div>

      <div class="group">
        <div class="glabel">Цель</div>
        <select [(ngModel)]="goalId" (ngModelChange)="onChange()">
          <option value="">— любая —</option>
          @for (g of state.goals(); track g.id) {
            <option [value]="g.id">{{ g.title }}</option>
          }
        </select>
      </div>

      <div class="group">
        <div class="glabel">Теги</div>
        <div class="chips">
          @for (t of state.tags(); track t) {
            <button class="chip" [class.on]="tags.includes(t)" (click)="toggleTag(t)">
              {{ t }}
            </button>
          }
          @if (state.tags().length === 0) {
            <span class="none">нет тегов</span>
          }
        </div>
      </div>

      <div class="group">
        <div class="glabel">Дедлайн</div>
        <div class="row2">
          <input type="date" [(ngModel)]="dueFrom" (ngModelChange)="onChange()" />
          <input type="date" [(ngModel)]="dueTo" (ngModelChange)="onChange()" />
        </div>
      </div>

      <div class="group">
        <div class="glabel">Потрачено, мин</div>
        <div class="row2">
          <input type="number" placeholder="от" [(ngModel)]="spentMin" (ngModelChange)="onChange()" />
          <input type="number" placeholder="до" [(ngModel)]="spentMax" (ngModelChange)="onChange()" />
        </div>
      </div>
    </div>
  `,
  styles: [`
    .backdrop {
      position: fixed; inset: 0;
      background: transparent;
      z-index: 900;
    }
    .popover {
      position: fixed;
      top: 60px;
      left: calc(var(--sidebar-width) + 16px);
      width: 340px;
      max-height: calc(100vh - 80px);
      overflow-y: auto;
      background: #fff;
      border: 1px solid var(--border);
      border-radius: 10px;
      box-shadow: 0 12px 32px rgba(0,0,0,.12);
      padding: 14px;
      z-index: 901;
    }
    .head {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 12px;
      font-weight: 600; font-size: 13px;
    }
    .reset {
      font-size: 11.5px; color: var(--accent);
      padding: 2px 6px; border-radius: 4px;
    }
    .reset:hover { background: var(--bg-hover); }
    .group { margin-bottom: 12px; }
    .glabel {
      font-size: 11px; text-transform: uppercase; letter-spacing: .05em;
      color: var(--text-muted);
      margin-bottom: 6px;
    }
    select, input[type=date], input[type=number] {
      width: 100%;
      padding: 6px 8px;
      border: 1px solid var(--border);
      border-radius: 6px;
      font-size: 12.5px;
      background: #fff;
    }
    .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
    .chips { display: flex; flex-wrap: wrap; gap: 4px; }
    .chip {
      padding: 3px 8px;
      border: 1px solid var(--border);
      border-radius: 12px;
      font-size: 11.5px;
      color: var(--text-soft);
    }
    .chip.on {
      background: var(--accent); color: #fff;
      border-color: var(--accent);
    }
    .none { font-size: 11.5px; color: var(--text-muted); }
  `],
})
export class FiltersPopoverComponent {
  state = inject(StateService);

  statuses: TaskStatus[] = ['todo', 'doing', 'done', 'cancelled'];

  projectId = this.state.filters().projectId ?? '';
  goalId = this.state.filters().goalId ?? '';
  tags = [...this.state.filters().tags];
  dueFrom = this.state.filters().dueFrom ?? '';
  dueTo = this.state.filters().dueTo ?? '';
  spentMin: number | null = this.state.filters().spentMin;
  spentMax: number | null = this.state.filters().spentMax;

  close(): void { this.state.closeFilters(); }

  statusLabel(s: TaskStatus): string {
    return s === 'todo' ? 'Todo' : s === 'doing' ? 'В работе' : s === 'done' ? 'Готово' : 'Отменено';
  }
  hasStatus(s: TaskStatus): boolean {
    return this.state.filters().statuses.includes(s);
  }
  toggleStatus(s: TaskStatus): void {
    const f = this.state.filters();
    const statuses = f.statuses.includes(s)
      ? f.statuses.filter((x) => x !== s)
      : [...f.statuses, s];
    this.state.setFilters({ ...f, statuses });
  }
  toggleTag(t: string): void {
    this.tags = this.tags.includes(t) ? this.tags.filter((x) => x !== t) : [...this.tags, t];
    this.onChange();
  }

  onChange(): void {
    const f = this.state.filters();
    this.state.setFilters({
      ...f,
      projectId: this.projectId || null,
      goalId: this.goalId || null,
      tags: [...this.tags],
      dueFrom: this.dueFrom || null,
      dueTo: this.dueTo || null,
      spentMin: this.spentMin != null && this.spentMin !== ('' as any) ? Number(this.spentMin) : null,
      spentMax: this.spentMax != null && this.spentMax !== ('' as any) ? Number(this.spentMax) : null,
    });
  }

  reset(): void {
    this.state.resetFilters();
    this.projectId = ''; this.goalId = ''; this.tags = [];
    this.dueFrom = ''; this.dueTo = '';
    this.spentMin = null; this.spentMax = null;
  }
}
```

---

### `client/src/app/features/entity-form.component.ts`

```typescript
import { Component, computed, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../core/state.service';

@Component({
  selector: 'app-entity-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="backdrop" (click)="close()"></div>
    <div class="modal" (click)="$event.stopPropagation()">
      <header class="head">
        <span>{{ isNew ? 'Новая ' + kindLabel : 'Редактирование' }}</span>
        <button class="close" (click)="close()">✕</button>
      </header>

      <label class="block">
        <span>Название</span>
        <input [(ngModel)]="title" autofocus />
      </label>

      @if (kind === 'project') {
        <label class="block">
          <span>Цель</span>
          <select [(ngModel)]="goalId">
            @for (g of state.goals(); track g.id) {
              <option [value]="g.id">{{ g.title }}</option>
            }
          </select>
        </label>
      }

      <label class="block">
        <span>Описание</span>
        <textarea rows="3" [(ngModel)]="description"></textarea>
      </label>

      <label class="block">
        <span>Статус</span>
        <select [(ngModel)]="status">
          <option value="active">Активно</option>
          <option value="archived">Архив</option>
        </select>
      </label>

      <footer class="foot">
        @if (!isNew) {
          <button class="danger" (click)="remove()">Удалить</button>
        }
        <div class="spacer"></div>
        <button class="ghost" (click)="close()">Отмена</button>
        <button class="primary" (click)="save()" [disabled]="!title.trim()">Сохранить</button>
      </footer>
    </div>
  `,
  styles: [`
    .backdrop {
      position: fixed; inset: 0;
      background: rgba(0,0,0,.25);
      z-index: 1000;
    }
    .modal {
      position: fixed;
      top: 12vh; left: 50%; transform: translateX(-50%);
      width: min(480px, 92vw);
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 20px 60px rgba(0,0,0,.25);
      padding: 18px;
      z-index: 1001;
    }
    .head {
      display: flex; justify-content: space-between; align-items: center;
      font-weight: 600; margin-bottom: 14px;
    }
    .close { color: var(--text-muted); width: 26px; height: 26px; border-radius: 6px; }
    .close:hover { background: var(--bg-hover); color: #000; }
    .block { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; font-size: 12px; }
    .block > span { color: var(--text-muted); text-transform: uppercase; font-size: 11px; letter-spacing: .04em; }
    input, textarea, select {
      padding: 7px 8px;
      border: 1px solid var(--border);
      border-radius: 6px;
      outline: none;
      background: #fff;
      font-size: 13px;
    }
    input:focus, textarea:focus, select:focus { border-color: var(--accent); }
    textarea { resize: vertical; font-family: inherit; }
    .foot {
      display: flex; gap: 8px; align-items: center;
      margin-top: 8px;
      border-top: 1px solid var(--border);
      padding-top: 14px;
    }
    .spacer { flex: 1; }
    .ghost, .primary, .danger {
      padding: 7px 14px;
      border-radius: 6px;
      font-size: 13px;
    }
    .ghost { border: 1px solid var(--border); }
    .ghost:hover { background: var(--bg-hover); }
    .primary { background: var(--accent); color: #fff; font-weight: 500; }
    .primary:hover { background: var(--accent-hover); }
    .primary:disabled { opacity: .4; cursor: not-allowed; }
    .danger { color: var(--danger); }
    .danger:hover { background: #fef2f2; }
  `],
})
export class EntityFormComponent {
  state = inject(StateService);

  kind = input.required<'goal' | 'project'>();
  entityId = input<string | null>(null);

  title = '';
  description = '';
  status: 'active' | 'archived' = 'active';
  goalId = '';

  isNew = computed(() => !this.entityId());

  get kindLabel(): string { return this.kind() === 'goal' ? 'цель' : 'проект'; }

  constructor() {
    queueMicrotask(() => this.init());
  }

  private init(): void {
    if (this.kind() === 'goal') {
      if (this.entityId()) {
        const g = this.state.goals().find((x) => x.id === this.entityId());
        if (g) {
          this.title = g.title;
          this.description = g.description;
          this.status = g.status;
        }
      }
    } else {
      if (this.entityId()) {
        const p = this.state.projects().find((x) => x.id === this.entityId());
        if (p) {
          this.title = p.title;
          this.description = p.description;
          this.status = p.status;
          this.goalId = p.goalId;
        }
      } else {
        const goals = this.state.goals();
        if (goals.length > 0) this.goalId = goals[0].id;
      }
    }
  }

  close(): void {
    if (this.kind() === 'goal') this.state.closeGoalForm();
    else this.state.closeProjectForm();
  }

  async save(): Promise<void> {
    const title = this.title.trim();
    if (!title) return;

    if (this.kind() === 'goal') {
      if (this.entityId()) {
        await this.state.updateGoal(this.entityId()!, {
          title,
          description: this.description,
          status: this.status,
        });
      } else {
        await this.state.createGoal({
          title,
          description: this.description,
          status: this.status,
        });
      }
    } else {
      const goalId = this.goalId || this.state.goals()[0]?.id;
      if (!goalId) return;
      if (this.entityId()) {
        await this.state.updateProject(this.entityId()!, {
          title,
          description: this.description,
          status: this.status,
          goalId,
        });
      } else {
        await this.state.createProject({
          goalId,
          title,
          description: this.description,
          status: this.status,
        });
      }
    }
    this.close();
  }

  async remove(): Promise<void> {
    const id = this.entityId();
    if (!id) return;
    const label = this.kind() === 'goal' ? 'цель' : 'проект';
    if (!confirm(`Удалить ${label} «${this.title}»? Все связанные данные будут удалены.`)) return;
    if (this.kind() === 'goal') await this.state.deleteGoal(id);
    else await this.state.deleteProject(id);
    this.close();
  }
}
```

---

## Корневой компонент

### `client/src/app/app.component.ts`

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from './core/state.service';
import { HotkeysService } from './core/hotkeys.service';
import { SidebarComponent } from './features/sidebar.component';
import { TopBarComponent } from './features/top-bar.component';
import { TaskListComponent } from './features/task-list.component';
import { TaskCardComponent } from './features/task-card.component';
import { QuickCaptureComponent } from './features/quick-capture.component';
import { CommandPaletteComponent } from './features/command-palette.component';
import { FiltersPopoverComponent } from './features/filters-popover.component';
import { EntityFormComponent } from './features/entity-form.component';
import { ToastComponent } from './shared/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    TopBarComponent,
    TaskListComponent,
    TaskCardComponent,
    QuickCaptureComponent,
    CommandPaletteComponent,
    FiltersPopoverComponent,
    EntityFormComponent,
    ToastComponent,
  ],
  template: `
    <div class="app">
      <app-sidebar></app-sidebar>
      <div class="main">
        <app-top-bar></app-top-bar>
        <app-task-list></app-task-list>
      </div>
    </div>

    @if (state.quickCaptureOpen()) { <app-quick-capture></app-quick-capture> }
    @if (state.commandPaletteOpen()) { <app-command-palette></app-command-palette> }
    @if (state.filtersOpen()) { <app-filters-popover></app-filters-popover> }

    @if (state.editingTaskId(); as id) {
      <app-task-card [taskId]="id"></app-task-card>
    }

    @if (state.editingGoalId(); as id) {
      <app-entity-form kind="goal" [entityId]="id || null"></app-entity-form>
    }

    @if (state.editingProjectId(); as id) {
      <app-entity-form kind="project" [entityId]="id || null"></app-entity-form>
    }

    <app-toast></app-toast>
  `,
  styles: [`
    .app {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }
    .main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-width: 0;
    }
  `],
})
export class AppComponent implements OnInit {
  state = inject(StateService);
  hotkeys = inject(HotkeysService);

  async ngOnInit(): Promise<void> {
    await this.state.loadAll();
    this.hotkeys.init();
  }
}
```

---
