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
