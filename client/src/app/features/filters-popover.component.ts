import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../core/state.service';
import { type TaskStatus } from '../core/models';

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
