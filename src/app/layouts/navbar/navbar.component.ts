import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SectionType } from '../../core/models/section.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
        <li class="nav-item">
          <a class="nav-link" 
             [routerLink]="['/sections']" 
             [queryParams]="{type: 'AcademicAndResearchEntities'}" 
             routerLinkActive="active">
            {{ 'NAV.ACADEMIC' | translate }}
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" 
             [routerLink]="['/sections']" 
             [queryParams]="{type: 'OurPartners'}" 
             routerLinkActive="active">
            {{ 'NAV.PARTNERS' | translate }}
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" 
             [routerLink]="['/sections']" 
             [queryParams]="{type: 'ContactUs'}" 
             routerLinkActive="active">
            {{ 'NAV.CONTACT' | translate }}
          </a>
        </li>
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
                {{ lang.flag }} {{ lang.name }}
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
  translate = inject(TranslateService);
  SectionType = SectionType;
  
  isLoggedIn = false;
  isAdmin = false;
  currentLanguage = 'en';
  
  languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦', rtl: true },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' }, // تم تحديث العلم هنا
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
getTypeName(type: SectionType): string {
  const translationKeys: Record<SectionType, string> = {
    [SectionType.HomePage]: 'SECTION.TYPES.HOME_PAGE',
    [SectionType.AcademicAndResearchEntities]: 'SECTION.TYPES.ACADEMIC_RESEARCH',
    [SectionType.OurPartners]: 'SECTION.TYPES.OUR_PARTNERS',
    [SectionType.ContactUs]: 'SECTION.TYPES.CONTACT_US',
    [SectionType.SadaARIDJournal]: 'SECTION.TYPES.SADA_ARID',
    [SectionType.HigherManagement]: 'SECTION.TYPES.HIGHER_MANAGEMENT',
    [SectionType.Media]: 'SECTION.TYPES.MEDIA',
    [SectionType.Books]: 'SECTION.TYPES.BOOKS'
  };
  
  return this.translate.instant(translationKeys[type] || type.toString());
}
  logout() {
    this.authService.logout();
  }
}