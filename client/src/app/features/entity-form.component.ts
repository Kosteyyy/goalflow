import { Component, computed, inject, input } from '@angular/core';
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
        <span>{{ isNew() ? ('Новая ' + kindLabel()) : 'Редактирование' }}</span>
        <button class="close" (click)="close()">✕</button>
      </header>

      <label class="block">
        <span>Название</span>
        <input [(ngModel)]="title" autofocus />
      </label>

      @if (kind() === 'project') {
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
        @if (!isNew()) {
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
  kindLabel = computed(() => (this.kind() === 'goal' ? 'цель' : 'проект'));

  constructor() {
    queueMicrotask(() => this.init());
  }

  private init(): void {
    if (this.kind() === 'goal') {
      const id = this.entityId();
      if (id) {
        const g = this.state.goals().find((x) => x.id === id);
        if (g) {
          this.title = g.title;
          this.description = g.description;
          this.status = g.status;
        }
      }
    } else {
      const id = this.entityId();
      if (id) {
        const p = this.state.projects().find((x) => x.id === id);
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
      const id = this.entityId();
      if (id) {
        await this.state.updateGoal(id, {
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
      const id = this.entityId();
      if (id) {
        await this.state.updateProject(id, {
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