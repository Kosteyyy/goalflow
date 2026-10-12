import { Component, inject } from '@angular/core';
import { ToastService } from '../core/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="toast-host">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast" [class.success]="t.type === 'success'"
                          [class.warning]="t.type === 'warning'"
                          [class.error]="t.type === 'error'"
                          (click)="toast.dismiss(t.id)">
          {{ t.message }}
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-host {
      position: fixed; bottom: 20px; right: 20px;
      display: flex; flex-direction: column; gap: 8px;
      z-index: 3000;
    }
    .toast {
      background: #222; color: #fff;
      padding: 10px 14px; border-radius: 6px;
      font-size: 13px; max-width: 320px;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,.15);
    }
    .toast.success { background: var(--success); }
    .toast.warning { background: var(--warning); }
    .toast.error { background: var(--danger); }
  `],
})
export class ToastComponent {
  toast = inject(ToastService);
}
