import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-sIdebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule],
  template: `
    <div class="sIdebar bg-dark text-white">
      <div class="sIdebar-header p-3">
        <h4 class="text-center">{{ 'SIdEBAR.TITLE' | translate }}</h4>
      </div>
      <ul class="nav flex-column">
        <li class="nav-item">
          <a class="nav-link" routerLink="/admin/sections" routerLinkActive="active">
            <i class="bi bi-collection me-2"></i> {{ 'SIdEBAR.MANAGE_SECTIONS' | translate }}
          </a>
        </li>
      </ul>
      <div class="sIdebar-footer p-3">
        <button class="btn btn-outline-light w-100" (click)="logout()">
          <i class="bi bi-box-arrow-left me-2"></i> {{ 'SIdEBAR.LOGOUT' | translate }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .sIdebar {
      wIdth: 250px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      transition: all 0.3s;
    }
    .sIdebar-header {
      border-bottom: 1px solId rgba(255, 255, 255, 0.1);
    }
    .nav-link {
      color: rgba(255, 255, 255, 0.7);
      padding: 0.75rem 1.5rem;
      border-left: 3px solId transparent;
      transition: all 0.3s;
    }
    .nav-link:hover {
      color: white;
      background: rgba(255, 255, 255, 0.1);
    }
    .nav-link.active {
      color: white;
      background: rgba(255, 255, 255, 0.1);
      border-left: 3px solId #0d6efd;
    }
    .sIdebar-footer {
      margin-top: auto;
      border-top: 1px solId rgba(255, 255, 255, 0.1);
    }
    .bi {
      font-size: 1.1rem;
    }
  `]
})
export class SIdebarComponent {
  authService = inject(AuthService);
  private translate = inject(TranslateService);

  logout() {
    this.authService.logout();
  }
}