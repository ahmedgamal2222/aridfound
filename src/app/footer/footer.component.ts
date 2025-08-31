import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SectionService } from '../core/services/section.service';
import { Section } from '../core/models/section.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  translate = inject(TranslateService);
  sectionService = inject(SectionService);
  
  currentYear = new Date().getFullYear();
  footerSections$!: Observable<Section[]>;

  socialLinks = [
    { icon: 'bi bi-facebook', Url: 'https://facebook.com' },
    { icon: 'bi bi-twitter-x', Url: 'https://twitter.com' },
    { icon: 'bi bi-linkedin', Url: 'https://linkedin.com' },
    { icon: 'bi bi-instagram', Url: 'https://instagram.com' },
    { icon: 'bi bi-youtube', Url: 'https://youtube.com' }
  ];

  quickLinks = [
    { label: 'NAV.HOME', path: '/' },
    { label: 'NAV.ACADEMIC', path: '/sections?type=AcademicAndResearchEntities' },
    { label: 'NAV.PARTNERS', path: '/sections?type=OurPartners' },
    { label: 'NAV.CONTACT', path: '/sections?type=ContactUs' },
    { label: 'FOOTER.PRIVACY', path: '/privacy' },
    { label: 'FOOTER.TERMS', path: '/terms' }
  ];

  contactInfo = {
    address: 'FOOTER.ADDRESS',
    phone: '+966 12 345 6789',
    email: 'info@arIdfoundation.org',
    workingHours: 'FOOTER.WORKING_HOURS'
  };

  ngOnInit() {
    // جلب أقسام التذييل من الخادم
    this.footerSections$ = this.sectionService.getFooterSections();
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('userLanguage', lang);
    
    // تغيير اتجاه الصفحة للغة العربية
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    window.location.reload(); // إعادة تحميل الصفحة لتطبيق التغييرات
  }
}