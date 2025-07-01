import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  translate = inject(TranslateService);
  currentYear = new Date().getFullYear();

  socialLinks = [
    { icon: 'bi bi-facebook', url: 'https://facebook.com' },
    { icon: 'bi bi-twitter-x', url: 'https://twitter.com' },
    { icon: 'bi bi-linkedin', url: 'https://linkedin.com' },
    { icon: 'bi bi-instagram', url: 'https://instagram.com' },
    { icon: 'bi bi-youtube', url: 'https://youtube.com' }
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
    email: 'info@aridfoundation.org',
    workingHours: 'FOOTER.WORKING_HOURS'
  };
}