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
