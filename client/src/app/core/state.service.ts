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
