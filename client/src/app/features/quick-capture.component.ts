import { Component, ElementRef, inject, viewChild } from '@angular/core';
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
