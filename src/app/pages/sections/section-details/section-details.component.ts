import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionService } from '../../../core/services/section.service';
import { Section, SectionType } from '../../../core/models/section.model';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { environment } from '../../../core/environments/environment';

@Component({
  selector: 'app-section-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="py-5" *ngIf="section">
      <div class="container">
        <div class="row">
          <div class="col-lg-8 mx-auto">
            <div class="text-center mb-5">
              <h1>{{section.title}}</h1>
              <p class="lead text-muted" *ngIf="section.description">
                {{section.description}}
              </p>
              
              <!-- Display section type badge -->
              <span class="badge" [ngClass]="getTypeBadgeClass(section.sectionType)">
                {{getTypeName(section.sectionType)}}
              </span>
            </div>
            
            <!-- Hero Image (if available) -->
            <div class="mb-4 text-center" *ngIf="section.heroImageUrl">
              <img [src]="section.heroImageUrl" 
                   [alt]="section.title" 
                   class="img-fluid rounded shadow-lg mb-4"
                   onerror="this.style.display='none'">
            </div>

            <!-- Main Image (if available and no hero image) -->
            <div class="mb-4 text-center" *ngIf="section.imageUrl && !section.heroImageUrl">
              <img [src]="section.imageUrl" 
                   [alt]="section.title" 
                   class="img-fluid rounded shadow"
                   onerror="this.style.display='none'">
            </div>

            <!-- Video Embed (for Media sections) -->
            <div class="mb-4" *ngIf="section.sectionType === SectionType.Media && section.videoUrl">
              <div class="ratio ratio-16x9">
                <video controls class="w-100 rounded border">
                  <source [src]="section.videoUrl" type="video/mp4">
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>

            <!-- PDF Download (for Books and Journal sections) -->
            <div class="text-center mb-4" *ngIf="(section.sectionType === SectionType.Books || 
                  section.sectionType === SectionType.SadaARIDJournal) && section.pdfUrl">
              <a [href]="section.pdfUrl" 
                 target="_blank" 
                 class="btn btn-primary btn-lg">
                <i class="fas fa-download me-2"></i>
                Download {{section.sectionType === SectionType.Books ? 'Book' : 'Journal'}}
              </a>
            </div>

            <!-- Journal Metadata -->
            <div class="card mb-4" *ngIf="section.sectionType === SectionType.SadaARIDJournal">
              <div class="card-body">
                <div class="row">
                  <div class="col-md-4">
                    <p><strong>ISSN:</strong> {{section.issn || 'N/A'}}</p>
                  </div>
                  <div class="col-md-4">
                    <p><strong>Volume:</strong> {{section.volume || 'N/A'}}</p>
                  </div>
                  <div class="col-md-4">
                    <p><strong>Issue:</strong> {{section.issue || 'N/A'}}</p>
                  </div>
                  <div class="col-12" *ngIf="section.publicationDate">
                    <p><strong>Published:</strong> {{section.publicationDate | date:'MMMM yyyy'}}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Contact Information -->
            <div class="card mb-4" *ngIf="section.sectionType === SectionType.ContactUs">
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6" *ngIf="section.address">
                    <h5>Address</h5>
                    <p>{{section.address}}</p>
                  </div>
                  <div class="col-md-6" *ngIf="section.phone || section.email">
                    <h5>Contact</h5>
                    <p *ngIf="section.phone"><strong>Phone:</strong> {{section.phone}}</p>
                    <p *ngIf="section.email"><strong>Email:</strong> {{section.email}}</p>
                  </div>
                  <div class="col-12" *ngIf="section.workingHours">
                    <h5>Working Hours</h5>
                    <p>{{section.workingHours}}</p>
                  </div>
                  <div class="col-12" *ngIf="section.mapEmbedUrl">
                    <div class="ratio ratio-16x9 mt-3">
                      <iframe [src]="sanitizer.bypassSecurityTrustResourceUrl(section.mapEmbedUrl)" 
                              allowfullscreen></iframe>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Main Content -->
            <div class="content" 
                 *ngIf="sanitizedContent"
                 [innerHTML]="sanitizedContent">
            </div>

            <div class="alert alert-info" *ngIf="!section.content">
              No content available for this section.
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="text-center py-5" *ngIf="loading">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div class="alert alert-danger text-center py-5" *ngIf="error && !loading">
      Failed to load section details. Please try again later.
    </div>
  `,
  styles: [`
    .content {
      line-height: 1.8;
    }
    .content img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 20px 0;
    }
    .content iframe {
      max-width: 100%;
      margin: 20px 0;
    }
    .badge {
      font-size: 0.9rem;
      padding: 0.5rem 1rem;
      margin-top: 1rem;
    }
  `]
})
export class SectionDetailsComponent {
  private sectionService = inject(SectionService);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);
  public sanitizer = inject(DomSanitizer);

  // Make SectionType available in template
  SectionType = SectionType;

  section?: Section;
  sanitizedContent?: SafeHtml;
  loading = true;
  error = false;

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.loadSection(id);
  }

  loadSection(id: number) {
    this.loading = true;
    this.error = false;
    
    this.sectionService.getSectionById(id).subscribe({
      next: (apiSection) => {
        this.section = this.transformSectionData(apiSection);
        this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(
          this.section.content || ''
        );
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading section:', err);
        this.toastr.error('Failed to load section details');
        this.loading = false;
        this.error = true;
      }
    });
  }

  private transformSectionData(apiData: any): Section {
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
      sectionType: apiData.SectionType,
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
      partnerType: apiData.PartnerType || ''
    };
  }

  getTypeName(type: SectionType): string {
    const typeNames: Record<SectionType, string> = {
      [SectionType.HomePage]: 'Home Page',
      [SectionType.AcademicAndResearchEntities]: 'Academic & Research',
      [SectionType.OurPartners]: 'Our Partners',
      [SectionType.ContactUs]: 'Contact Us',
      [SectionType.SadaARIDJournal]: 'Journal',
      [SectionType.HigherManagement]: 'Management',
      [SectionType.Media]: 'Media',
      [SectionType.Books]: 'Book'
    };
    return typeNames[type] || type.toString();
  }

  getTypeBadgeClass(type: SectionType): string {
    const typeClasses: Record<SectionType, string> = {
      [SectionType.HomePage]: 'bg-primary',
      [SectionType.AcademicAndResearchEntities]: 'bg-success',
      [SectionType.OurPartners]: 'bg-info text-dark',
      [SectionType.ContactUs]: 'bg-warning text-dark',
      [SectionType.SadaARIDJournal]: 'bg-danger',
      [SectionType.HigherManagement]: 'bg-dark',
      [SectionType.Media]: 'bg-purple',
      [SectionType.Books]: 'bg-brown'
    };
    return typeClasses[type] || 'bg-secondary';
  }
}