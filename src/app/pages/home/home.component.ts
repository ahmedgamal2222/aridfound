import { Component, OnInit } from '@angular/core';
import { SectionService } from '../../core/services/section.service';
import { Section, ViewType } from '../../core/models/section.model';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { ModalModule, BsModalService } from 'ngx-bootstrap/modal';
import { RouterLink, RouterModule } from '@angular/router';
import { TruncatePipe } from '../../../truncate.pipe';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { PartnerSlIderComponent } from '../../partner-slider/partner-slider.component';
import { environment } from '../../core/environments/environment';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideAnimations } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    CarouselModule,
    ModalModule,
    RouterModule,
    TruncatePipe,
    TranslateModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [
    BsModalService,
    provideAnimations()
  ]
})
export class HomeComponent implements OnInit {
[x: string]: any;
  sections: Section[] = [];
  heroSections: Section[] = [];
  homeSections: Section[] = [];
  featuredSections: Section[] = [];
  partners: Section[] = [];
  books: Section[] = [];
  journals: Section[] = [];
  management: Section[] = [];
  vIdeos: Section[] = [];
  grIdSections: Section[] = [];
  
  modalRef?: BsModalRef;
  selectedItem?: Section;
  $even: any;
hero: any;

  constructor(
    private sectionService: SectionService,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private sanitizer: DomSanitizer,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.loadSections();
  }

  loadSections() {
    this.sectionService.getHomePageSections().subscribe({
      next: (sections) => {
        this.sections = sections.map(s => this.transformSectionData(s));
        this.categorizeSections();
      },
      error: (err) => this.handleError('Home sections', err)
    });
  }

 private categorizeSections() {
  this.heroSections = this.sections.filter(s =>
    s.ViewType === ViewType.HeroImage || s.ViewType === ViewType.SliderHero
  );

  this.homeSections = this.sections.filter(s =>
    s.ViewType === ViewType.HtmlBlock
  );

  this.featuredSections = this.sections.filter(s =>
    [ViewType.List3Items, ViewType.List4Items].includes(s.ViewType as ViewType)
  );

  this.vIdeos = this.sections.filter(s =>
    s.ViewType === ViewType.Video
  );

  this.grIdSections = this.sections.filter(s =>
    [ViewType.AutoScroll, ViewType.ArrowScroll, ViewType.FixedScroll].includes(s.ViewType as ViewType)
  );
}


private transformSectionData(section: Section): Section {
  return {
    ...section,
    ViewType: section.ViewType || '', // تعيين قيمة افتراضية إذا كانت غير موجودة
    Contents: section.Contents || [],
    CreatedAt: new Date(section.CreatedAt),
    UpdatedAt: new Date(section.UpdatedAt)
  };
}

getFullImageUrl(path: string | undefined): string {
  if (!path) return 'assets/images/placeholder.jpg';
  
  // إذا كانت الصورة مشفرة بـ Base64
  if (path.startsWith('data:image/')) {
    return path;
  }
  
  // إذا كان المسار يحتوي على عنوان URL كامل بالفعل
  if (path.startsWith('http')) return path;
  
  // إذا كان المسار يبدأ بـ uploads/
  if (path.startsWith('uploads/') || path.startsWith('/uploads/')) {
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${environment.apiUrl}/${cleanPath}`;
  }
  
  // إذا كان المسار يبدأ مباشرة بـ sections/
  if (path.startsWith('sections/') || path.startsWith('/sections/')) {
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${environment.apiUrl}/uploads/${cleanPath}`;
  }
  
  // للمسارات الأخرى
  const baseUrl = environment.apiUrl.replace('/api', '');
  return path.startsWith('/') ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
}
  getSafeVIdeoUrl(Url: string): SafeResourceUrl {
    if (!Url) return '';
    
    if (Url.includes('youtube.com') || Url.includes('youtu.be')) {
      const vIdeoId = this.extractYouTubeId(Url);
      if (vIdeoId) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://www.youtube.com/embed/${vIdeoId}?rel=0&showinfo=0`
        );
      }
    }
    
    if (Url.includes('vimeo.com')) {
      const vIdeoId = Url.split('vimeo.com/')[1].split('?')[0];
      if (vIdeoId) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://player.vimeo.com/vIdeo/${vIdeoId}?title=0&byline=0&portrait=0`
        );
      }
    }
    
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.getFullImageUrl(Url));
  }

  private extractYouTubeId(Url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = Url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

 

  private handleError(sectionType: string, error: any) {
    console.error(`Error loading ${sectionType}:`, error);
    this.toastr.error(this.translate.instant('ERROR.LOAD_SECTION', { section: sectionType }));
  }

  // دالة مساعدة لتحديد نمط العرض بناءً على ViewType
getSectionStyle(section: Section): any {
  const style: any = {};
  
  if (!section.ViewType) return style; // إرجاع كائن فارغ إذا لم يكن ViewType موجودًا
  
  if (section.ViewType.includes('Hero')) {
    style['background-color'] = '#f8f9fa';
    style['padding'] = '4rem 0';
  }
  
  if (section.ViewType.includes('Dark')) {
    style['background-color'] = '#343a40';
    style['color'] = 'white';
  }
  
  return style;
}
}