import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionService } from './../../../core/services/section.service';
import { Section, SectionType, PartnerType } from '../../../core/models/section.model';
import { ActivatedRoute, Router } from '@angular/router';
import { CardComponent } from '../../../card/card.component';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../core/environments/environment';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-sections',
  standalone: true,
  imports: [CommonModule, CardComponent, TranslateModule],
  template: `
    <section class="py-5">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2>{{currentType ? getTypeName(currentType) : ('SECTION.ALL_SECTIONS' | translate)}}</h2>
          <div class="btn-group" *ngIf="authService.isAdmin()">
            <button class="btn btn-primary" routerLink="/admin/sections">
              {{ 'SECTION.MANAGE' | translate }}
            </button>
          </div>
        </div>
        
        <div class="row g-4">
          <div class="col-md-6 col-lg-4" *ngFor="let section of sections; trackBy: trackBySectionId">
            <app-card [section]="section"></app-card>
          </div>
        </div>

        <div class="alert alert-info mt-4" *ngIf="sections.length === 0">
          {{ 'SECTION.NO_SECTIONS_FOUND' | translate }}
        </div>
      </div>
    </section>
  `,
  styles: []
})
export class SectionsComponent {
    private translate = inject(TranslateService);
  private sectionService = inject(SectionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  authService = inject(AuthService);

  sections: Section[] = [];
  currentType?: SectionType;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.currentType = params['type'] as SectionType;
      this.loadSections();
    });
  }

  loadSections() {
    const handleSections = (sections: any[]) => {
      this.sections = sections.map(s => this.transformIncomingData(s));
    };

    if (this.currentType) {
      this.sectionService.getSectionsByType(this.currentType).subscribe({
        next: handleSections,
        error: (err) => this.toastr.error('Failed to load sections')
      });
    } else {
      this.sectionService.getAllSections().subscribe({
        next: handleSections,
        error: (err) => this.toastr.error('Failed to load sections')
      });
    }
  }

  private transformIncomingData(apiData: any): Section {
    const getFullUrl = (path: string | undefined): string => {
      if (!path) return '';
      if (path.startsWith('http')) return path;
      
      const baseUrl = environment.apiUrl.replace('/api', '');
      return path.startsWith('/') ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
    };

    return {
      id: apiData.Id,
      title: apiData.Title,
      titleAr: apiData.TitleAr || '',
      sectionType: apiData.SectionType as SectionType,
      description: apiData.Description || '',
      descriptionAr: apiData.DescriptionAr || '',
      content: apiData.Content || '',
      contentAr: apiData.ContentAr || '',
      imageUrl: getFullUrl(apiData.ImageUrl),
      heroImageUrl: getFullUrl(apiData.HeroImageUrl),
      videoUrl: getFullUrl(apiData.VideoUrl),
      pdfUrl: getFullUrl(apiData.PdfUrl),
      order: apiData.Order || 0,
      isActive: apiData.IsActive ?? true,
      showInHomePage: apiData.ShowInHomePage ?? false,
      isHeroSection: apiData.IsHeroSection ?? false,
      createdAt: new Date(apiData.CreatedAt),
      updatedAt: new Date(apiData.UpdatedAt),
      // Journal specific
      issn: apiData.ISSN || '',
      volume: apiData.Volume || null,
      issue: apiData.Issue || null,
      publicationDate: apiData.PublicationDate ? new Date(apiData.PublicationDate) : null,
      // Contact specific
      address: apiData.Address || '',
      addressAr: apiData.AddressAr || '',
      phone: apiData.Phone || '',
      email: apiData.Email || '',
      workingHours: apiData.WorkingHours || '',
      workingHoursAr: apiData.WorkingHoursAr || '',
      mapEmbedUrl: apiData.MapEmbedUrl || '',
      // Management specific
      position: apiData.Position || '',
      positionAr: apiData.PositionAr || '',
      // Partner specific
      websiteUrl: apiData.WebsiteUrl || '',
      partnerType: apiData.PartnerType as PartnerType || null
    };
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

  trackBySectionId(index: number, section: Section): number {
    return section.id;
  }
}