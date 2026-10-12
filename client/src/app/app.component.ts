import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from './core/state.service';
import { HotkeysService } from './core/hotkeys.service';
import { SidebarComponent } from './features/sidebar.component';
import { TopBarComponent } from './features/top-bar.component';
import { TaskListComponent } from './features/task-list.component';
import { TaskCardComponent } from './features/task-card.component';
import { QuickCaptureComponent } from './features/quick-capture.component';
import { CommandPaletteComponent } from './features/command-palette.component';
import { FiltersPopoverComponent } from './features/filters-popover.component';
import { EntityFormComponent } from './features/entity-form.component';
import { ToastComponent } from './shared/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    TopBarComponent,
    TaskListComponent,
    TaskCardComponent,
    QuickCaptureComponent,
    CommandPaletteComponent,
    FiltersPopoverComponent,
    EntityFormComponent,
    ToastComponent,
  ],
  template: `
    <div class="app">
      <app-sidebar></app-sidebar>
      <div class="main">
        <app-top-bar></app-top-bar>
        <app-task-list></app-task-list>
      </div>
    </div>

    @if (state.quickCaptureOpen()) { <app-quick-capture></app-quick-capture> }
    @if (state.commandPaletteOpen()) { <app-command-palette></app-command-palette> }
    @if (state.filtersOpen()) { <app-filters-popover></app-filters-popover> }

    @if (state.editingTaskId(); as id) {
      <app-task-card [taskId]="id"></app-task-card>
    }

    @if (state.editingGoalId(); as id) {
      <app-entity-form kind="goal" [entityId]="id || null"></app-entity-form>
    }

    @if (state.editingProjectId(); as id) {
      <app-entity-form kind="project" [entityId]="id || null"></app-entity-form>
    }

    <app-toast></app-toast>
  `,
  styles: [`
    .app {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }
    .main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-width: 0;
    }
  `],
})
export class AppComponent implements OnInit {
  state = inject(StateService);
  hotkeys = inject(HotkeysService);

  async ngOnInit(): Promise<void> {
    await this.state.loadAll();
    this.hotkeys.init();
  }
}
