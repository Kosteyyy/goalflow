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
