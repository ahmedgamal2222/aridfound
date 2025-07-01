import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../../layouts/sidebar/sidebar.component';
import { NavbarComponent } from '../../../layouts/navbar/navbar.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  template: `
    <div class="admin-layout">
      <app-sidebar></app-sidebar>
      <div class="main-content">
        <div class="container-fluid py-4">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      min-height: 100vh;
    }
    .main-content {
      flex: 1;
      background-color: #f8f9fa;
    }
  `]
})
export class AdminDashboardComponent {}