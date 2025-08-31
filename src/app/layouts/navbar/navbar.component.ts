import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SectionService } from '../../core/services/section.service';
import { Section } from '../../core/models/section.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule],
  template: `
<nav class="navbar navbar-expand-lg navbar-dark custom-purple-bg">
  <div class="container">
    <a class="navbar-brand d-flex align-items-center gap-2" routerLink="/">
      <img src="/logo.png" alt="Logo" class="logo-img">
      <span>{{ 'APP.TITLE' | translate }}</span>
    </a>
    
    <button class="navbar-toggler" type="button" 
            data-bs-toggle="collapse" data-bs-target="#navbarNav">
      <span class="navbar-toggler-icon"></span>
    </button>
    
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav me-auto">
        <li class="nav-item">
          <a class="nav-link" routerLink="/" routerLinkActive="active">
            {{ 'NAV.HOME' | translate }}
          </a>
        </li>
        
        <!-- عرض أقسام القائمة الديناميكية -->
        <ng-container *ngIf="menuSections$ | async as sections">
          <li class="nav-item" *ngFor="let section of sections">
            <a class="nav-link" 
               [routerLink]="['/section', section.Id]" 
               routerLinkActive="active">
              {{ section.Name }}
            </a>
          </li>
        </ng-container>
      </ul>
      
      <ul class="navbar-nav">
        <!-- Language Selector -->
        <li class="nav-item dropdown" *ngIf="languages.length > 1">
          <a class="nav-link dropdown-toggle" href="#" id="languageDropdown"
             role="button" data-bs-toggle="dropdown" aria-expanded="false">
            {{ currentLanguage | uppercase }}
          </a>
          <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="languageDropdown">
            <li *ngFor="let lang of languages">
              <a class="dropdown-item" (click)="changeLanguage(lang.code)">
                {{ lang.flag }} {{ lang.Name }}
              </a>
            </li>
          </ul>
        </li>
        
        <ng-container *ngIf="isLoggedIn; else notLoggedIn">
          <li class="nav-item" *ngIf="isAdmin">
            <a class="nav-link" routerLink="/admin">
              {{ 'NAV.ADMIN' | translate }}
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" (click)="logout()" style="cursor: pointer">
              {{ 'NAV.LOGOUT' | translate }}
            </a>
          </li>
        </ng-container>
        
        <ng-template #notLoggedIn>
          <li class="nav-item">
            <a class="nav-link" routerLink="/login">
              {{ 'NAV.LOGIN' | translate }}
            </a>
          </li>
        </ng-template>
      </ul>
    </div>
  </div>
</nav>
  `,
  styles: [`
    .navbar {
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .logo-img {
      height: 60px;
      width: auto;
      object-fit: contain;
    }
    .nav-link {
      font-weight: 500;
    }
    .custom-purple-bg {
      background-color: #6f42c1 !important;
    }
    /* RTL Support */
    [dir="rtl"] .navbar-nav.me-auto {
      margin-right: auto !important;
      margin-left: 0 !important;
    }
    [dir="rtl"] .dropdown-menu {
      text-align: right;
    }
    [dir="rtl"] .dropdown-toggle::after {
      margin-left: 0;
      margin-right: 0.255em;
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  sectionService = inject(SectionService);
  translate = inject(TranslateService);
  
  isLoggedIn = false;
  isAdmin = false;
  currentLanguage = 'en';
  menuSections$!: Observable<Section[]>;
  
  languages = [
    { code: 'en', Name: 'English', flag: '🇬🇧' },
    { code: 'ar', Name: 'العربية', flag: '🇸🇦', rtl: true },
    { code: 'es', Name: 'Español', flag: '🇪🇸' },
    { code: 'fr', Name: 'Français', flag: '🇫🇷' },
    { code: 'de', Name: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh', Name: '中文', flag: '🇨🇳' },
    { code: 'ru', Name: 'Русский', flag: '🇷🇺' },
    { code: 'pt', Name: 'Português', flag: '🇵🇹' },
    { code: 'ja', Name: '日本語', flag: '🇯🇵' },
    { code: 'hi', Name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'tr', Name: 'Türkçe', flag: '🇹🇷' },
  ];

  ngOnInit() {
    // تحميل اللغة المحفوظة أو لغة المتصفح
    const savedLang = localStorage.getItem('userLanguage') || 
                     this.translate.getBrowserLang() || 'en';
    this.currentLanguage = savedLang;
    this.translate.use(savedLang);
    
    // إعداد اتجاه الصفحة للغة العربية
    if (savedLang === 'ar') {
      document.documentElement.dir = 'rtl';
    }

    // جلب أقسام القائمة
    this.menuSections$ = this.sectionService.getMenuSections();

    this.authService.currentUser.subscribe(user => {
      this.isAdmin = user?.Roles?.includes('Admin') ?? false;
    });

    if (this.authService.isLoggedIn()) {
      this.isLoggedIn = true;
    }
    
    this.authService.isAuthenticated$.subscribe(auth => {
      this.isLoggedIn = auth;
      this.isAdmin = this.authService.isAdmin();
    });
  }

  changeLanguage(lang: string) {
    this.currentLanguage = lang;
    this.translate.use(lang);
    localStorage.setItem('userLanguage', lang);
    
    // تغيير اتجاه الصفحة
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  logout() {
    this.authService.logout();
  }
}