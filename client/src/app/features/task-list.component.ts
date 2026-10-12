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
