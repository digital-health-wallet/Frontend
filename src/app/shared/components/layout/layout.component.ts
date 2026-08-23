import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, ToastModule, ConfirmDialogModule],
  template: `
    <div class="app-layout">
      <p-toast />
      <p-confirmDialog acceptButtonStyleClass="p-button-danger" rejectButtonStyleClass="p-button-text" />
      <app-sidebar />
      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
      background: var(--bg-main);
    }

    .main-content {
      flex: 1;
      margin-left: var(--sidebar-width);
      padding: var(--spacing-lg) var(--spacing-xl);
      overflow-y: auto;
      min-height: 100vh;

      @media (max-width: 768px) {
        margin-left: var(--sidebar-collapsed);
        padding: var(--spacing-md);
      }
    }
  `],
})
export class LayoutComponent {}
