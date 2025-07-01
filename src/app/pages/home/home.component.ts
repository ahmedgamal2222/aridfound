import { Component, OnInit } from '@angular/core';
import { SectionService } from '../../core/services/section.service';
import { Section, SectionType } from '../../core/models/section.model';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { ModalModule, BsModalService } from 'ngx-bootstrap/modal';
import { RouterLink } from '@angular/router';
import { TruncatePipe } from '../../../truncate.pipe';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { PartnerSliderComponent } from '../../partner-slider/partner-slider.component';
import { BookModalComponent } from '../../book-modal/book-modal.component';
import { JournalModalComponent } from '../../journal-modal/journal-modal.component';
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
    TruncatePipe,
    RouterLink,
    PartnerSliderComponent,
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
  heroSections: Section[] = [];
  homeSections: Section[] = [];
  featuredSections: Section[] = [];
  partners: Section[] = [];
  books: Section[] = [];
  journals: Section[] = [];
  management: Section[] = [];
  videos: Section[] = [];
  
  modalRef?: BsModalRef;
  selectedItem?: Section;
$even: any;

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
    const transformData = (data: any): Section => ({
      id: data.Id,
      title: data.Title,
      titleAr: data.TitleAr || '',
      sectionType: data.SectionType as SectionType,
      description: data.Description || '',
      descriptionAr: data.DescriptionAr || '',
      content: data.Content || '',
      contentAr: data.ContentAr || '',
      imageUrl: data.ImageUrl || '',
      heroImageUrl: data.HeroImageUrl || '',
      videoUrl: data.VideoUrl || '',
      pdfUrl: data.PdfUrl || '',
      order: data.Order || 0,
      isActive: data.IsActive ?? true,
      showInHomePage: data.ShowInHomePage ?? false,
      isHeroSection: data.IsHeroSection ?? false,
      createdAt: new Date(data.CreatedAt),
      updatedAt: new Date(data.UpdatedAt),
      issn: data.ISSN || '',
      volume: data.Volume || null,
      issue: data.Issue || null,
      publicationDate: data.PublicationDate ? new Date(data.PublicationDate) : null,
      address: data.Address || '',
      addressAr: data.AddressAr || '',
      phone: data.Phone || '',
      email: data.Email || '',
      workingHours: data.WorkingHours || '',
      workingHoursAr: data.WorkingHoursAr || '',
      mapEmbedUrl: data.MapEmbedUrl || '',
      position: data.Position || '',
      positionAr: data.PositionAr || '',
      websiteUrl: data.WebsiteUrl || '',
      partnerType: data.PartnerType || null
    });

    this.sectionService.getHeroSections().subscribe({
      next: (sections: any[]) => this.heroSections = sections.map(transformData),
      error: (err: any) => this.handleError('Hero sections', err)
    });

    this.sectionService.getHomePageSections().subscribe({
      next: (sections: any[]) => this.homeSections = sections.map(transformData),
      error: (err: any) => this.handleError('Home sections', err)
    });

    this.sectionService.getAllSections().subscribe({
      next: (sections: any[]) => {
        const allSections = sections.map(transformData);
        this.featuredSections = allSections
          .filter(s => s.sectionType === SectionType.AcademicAndResearchEntities)
          .slice(0, 3);
        
        this.partners = allSections.filter(s => s.sectionType === SectionType.OurPartners);
        this.books = allSections.filter(s => s.sectionType === SectionType.Books);
        this.journals = allSections.filter(s => s.sectionType === SectionType.SadaARIDJournal);
        this.management = allSections.filter(s => s.sectionType === SectionType.HigherManagement);
        this.videos = allSections.filter(s => s.videoUrl);
      },
      error: (err: any) => this.handleError('All sections', err)
    });
  }
getFullVideoUrl(videoUrl: string | undefined): string {
  if (!videoUrl) return '#';
  
  // إذا كان الرابط يبدأ بـ http أو https فهو رابط خارجي
  if (videoUrl.startsWith('http')) {
    return videoUrl;
  }
  
  // إذا كان الرابط يبدأ بـ / فهو رابط محلي
  if (videoUrl.startsWith('/')) {
    const baseUrl = environment.apiUrl.replace('/api', '');
    return `${baseUrl}${videoUrl}`;
  }
  
  // إذا كان الرابط لا يبدأ بـ / ولا http
  const baseUrl = environment.apiUrl.replace('/api', '');
  return `${baseUrl}/${videoUrl}`;
}
  getFullImageUrl(relativePath: string | undefined): string {
    if (!relativePath) return '';
    if (relativePath.startsWith('http')) return relativePath;
    const baseUrl = environment.apiUrl.replace('/api', '');
    return relativePath.startsWith('/') ? `${baseUrl}${relativePath}` : `${baseUrl}/${relativePath}`;
  }

getSafeVideoUrl(url: string): SafeResourceUrl {
  if (!url) return '';
  
  // Handle YouTube URLs
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const videoId = this.extractYouTubeId(url);
    if (videoId) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0`
      );
    }
  }
  
  // Handle Vimeo URLs
  if (url.includes('vimeo.com')) {
    const videoId = url.split('vimeo.com/')[1].split('?')[0];
    if (videoId) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`
      );
    }
  }
  
  // Handle local video URLs
  if (url.startsWith('/') || !url.startsWith('http')) {
    const baseUrl = environment.apiUrl.replace('/api', '');
    const fullUrl = url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);
  }
  
  // For other external URLs
  return this.sanitizer.bypassSecurityTrustResourceUrl(url);
}

  private extractYouTubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  openBookModal(book: Section) {
    this.selectedItem = book;
    this.modalRef = this.modalService.show(BookModalComponent, {
      initialState: { book },
      class: 'modal-lg'
    });
  }

  openJournalModal(journal: Section) {
    this.selectedItem = journal;
    this.modalRef = this.modalService.show(JournalModalComponent, {
      initialState: { journal },
      class: 'modal-lg'
    });
  }

  private handleError(sectionType: string, error: any) {
    console.error(`Error loading ${sectionType}:`, error);
    this.toastr.error(`Failed to load ${sectionType}`);
  }
}