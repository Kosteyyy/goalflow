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
