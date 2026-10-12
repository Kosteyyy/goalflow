import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  type: 'success' | 'warning' | 'error';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private counter = 0;

  success(message: string): void { this.push('success', message); }
  warning(message: string): void { this.push('warning', message); }
  error(message: string): void { this.push('error', message); }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private push(type: Toast['type'], message: string): void {
    const id = ++this.counter;
    this.toasts.update((list) => [...list, { id, type, message }]);
    setTimeout(() => this.dismiss(id), 4000);
  }
}
