import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SectionService } from '../../../core/services/section.service';
import { Section } from '../../../core/models/section.model';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { environment } from '../../../core/environments/environment';

@Component({
  selector: 'app-section-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-4">
      <div class="row justify-content-center">
        <div class="col-lg-10">
          <div class="card shadow-sm">
            <div class="card-header bg-primary text-white">
              <h2 class="card-title mb-0">{{ section?.Name || 'قسم غير معروف' }}</h2>
            </div>
            <div class="card-body">
              <!-- تحقق من وجود section ومحتوياته -->
              <div *ngIf="section && hasContents(); else noContent">
                <div *ngFor="let content of getContents()" class="content-item mb-4 p-3 border rounded">
                  <h3 class="content-title">{{ content.Subject || 'بدون عنوان' }}</h3>
                  <div class="content-body" [innerHTML]="getSafeContent(content.Content)"></div>
                  
                  <div *ngIf="content.Image" class="content-image mt-3">
                    <img [src]="getFullImageUrl(content.Image)" 
                         [alt]="content.Subject || 'صورة المحتوى'" 
                         class="img-fluid rounded">
                  </div>
                  
                  <div *ngIf="content.Url" class="content-video mt-3">
                    <div class="ratio ratio-16x9">
                      <iframe [src]="getSafeVideoUrl(content.Url)" 
                              frameborder="0" 
                              allowfullscreen></iframe>
                    </div>
                  </div>
                </div>
              </div>
              
              <ng-template #noContent>
                <div class="text-center text-muted py-5">
                  <p *ngIf="section && (!section.Contents || section.Contents.length === 0)">
                    لا يوجد محتوى متاح لهذا القسم حالياً.
                  </p>
                  <p *ngIf="!section">
                    جاري تحميل القسم...
                  </p>
                </div>
              </ng-template>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .content-item {
      background-color: #f8f9fa;
    }
    .content-title {
      color: #495057;
      border-bottom: 2px solid #6f42c1;
      padding-bottom: 0.5rem;
    }
  `]
})
export class SectionDetailsComponent implements OnInit {
  section: Section | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private sectionService: SectionService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSection(parseInt(id, 10));
    } else {
      this.error = 'معرف القسم غير صحيح';
      this.loading = false;
    }
  }

  loadSection(id: number): void {
    this.loading = true;
    this.error = null;
    
    this.sectionService.getSectionById(id).subscribe({
      next: (section) => {
        this.section = section;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading section:', error);
        this.error = 'حدث خطأ أثناء تحميل القسم';
        this.loading = false;
      }
    });
  }

  // دالة للتحقق من وجود محتويات
  hasContents(): boolean {
    return !!this.section && 
           !!this.section.Contents && 
           this.section.Contents.length > 0;
  }

  // دالة للحصول على المحتويات بشكل آمن
  getContents(): any[] {
    return this.section?.Contents || [];
  }

  getSafeContent(content: string | null | undefined): SafeHtml {
    if (!content) {
      return this.sanitizer.bypassSecurityTrustHtml('<p>لا يوجد محتوى</p>');
    }
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  getFullImageUrl(imagePath: string | null | undefined): string {
    if (!imagePath) return '';
    
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('data:image/')) return imagePath;
    
    return `${environment.apiUrl}/uploads/${imagePath}`;
  }

  getSafeVideoUrl(url: string | null | undefined): any {
    if (!url) return this.sanitizer.bypassSecurityTrustResourceUrl('');
    
    let videoUrl = url;
    
    // Convert YouTube url to embed format
    if (videoUrl.includes('youtube.com/watch?v=')) {
      videoUrl = videoUrl.replace('youtube.com/watch?v=', 'youtube.com/embed/');
    } else if (videoUrl.includes('youtu.be/')) {
      videoUrl = videoUrl.replace('youtu.be/', 'youtube.com/embed/');
    } else if (videoUrl.includes('vimeo.com/')) {
      videoUrl = videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/');
    }
    
    return this.sanitizer.bypassSecurityTrustResourceUrl(videoUrl);
  }

  // دالة مساعدة لعرض حالة التحميل
  isLoading(): boolean {
    return this.loading;
  }

  // دالة مساعدة للتحقق من وجود خطأ
  hasError(): boolean {
    return this.error !== null;
  }
}