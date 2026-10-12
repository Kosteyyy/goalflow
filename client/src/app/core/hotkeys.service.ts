import { Injectable, inject } from '@angular/core';
import { StateService } from './state.service';

@Injectable({ providedIn: 'root' })
export class HotkeysService {
  private state = inject(StateService);
  private pendingG = false;
  private pendingTimeout: ReturnType<typeof setTimeout> | null = null;

  init(): void {
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
  }

  private onKeyDown(e: KeyboardEvent): void {
    const target = e.target as HTMLElement;
    const inInput = target && (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    );

    // Cmd+K / Ctrl+K — всегда работает
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      this.state.toggleCommandPalette();
      return;
    }

    // Esc — закрыть всё
    if (e.key === 'Escape') {
      this.state.closeAllModals();
      return;
    }

    if (inInput) return;

    // G-префикс
    if (this.pendingG) {
      this.pendingG = false;
      if (this.pendingTimeout) clearTimeout(this.pendingTimeout);
      const k = e.key.toLowerCase();
      if (k === 'g') this.state.selectPreset('inbox');
      else if (k === 'p') this.state.selectPreset('in_progress');
      else if (k === 't') this.state.selectPreset('today');
      e.preventDefault();
      return;
    }

    switch (e.key.toLowerCase()) {
      case 'n':
        e.preventDefault();
        this.state.openQuickCapture();
        break;
      case '/':
        e.preventDefault();
        this.state.requestSearchFocus();
        break;
      case 'g':
        e.preventDefault();
        this.pendingG = true;
        this.pendingTimeout = setTimeout(() => { this.pendingG = false; }, 800);
        break;
      case 'e':
        if (this.state.selectedTaskId()) {
          e.preventDefault();
          this.state.openTaskCard(this.state.selectedTaskId()!);
        }
        break;
      case ' ':
        if (this.state.selectedTaskId()) {
          e.preventDefault();
          this.state.toggleTimer(this.state.selectedTaskId()!);
        }
        break;
    }
  }
}
