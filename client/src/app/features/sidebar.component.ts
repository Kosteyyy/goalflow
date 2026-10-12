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
