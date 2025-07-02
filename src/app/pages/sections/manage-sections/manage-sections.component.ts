import { Component, inject } from '@angular/core';
import { SectionService } from '../../../core/services/section.service';
import { Section, SectionType, PartnerType } from '../../../core/models/section.model';
import { ToastrService } from 'ngx-toastr';
import { FormsModule, NgForm } from '@angular/forms';
import { ModalComponent } from '../../../modal/modal.component';
import { environment } from '../../../core/environments/environment';


import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

type TabType = 'info' | 'content' | 'images' | 'specific';

interface Tab {
  id: TabType;
  label: string;
  icon: any;
  translationKey: string;
}

@Component({
  selector: 'app-manage-sections',
  standalone: true,
  imports: [FormsModule, CommonModule, ModalComponent, TranslateModule],
  templateUrl: './manage-sections.component.html',
  styleUrls: ['./manage-sections.component.css']
})
export class ManageSectionsComponent {

  private sectionService = inject(SectionService);
  private toastr = inject(ToastrService);
  private sanitizer = inject(DomSanitizer);
  private translate = inject(TranslateService);

  SectionType = SectionType;
  PartnerType = PartnerType;

  state = {
    sections: [] as Section[],
    filteredSections: [] as Section[],
    loadingStates: {} as { [id: number]: boolean },
    isSubmitting: false,
    showModal: false,
    isEditing: false,
    currentTab: 'info' as TabType,
    currentFilter: 'all' as SectionType | 'all',
    currentSection: this.createEmptySection(),
    fileInputs: {
      main: null as File | null,
      hero: null as File | null,
      video: null as File | null,
      pdf: null as File | null
    },
    filePreviews: {
      main: null as string | null,
      hero: null as string | null
    }
  };

  readonly sectionTypes = Object.values(SectionType);
  readonly partnerTypes = Object.values(PartnerType);
  readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  icons: any;

  // دالة لترجمة النصوص الديناميكية
  translateDynamic(key: string, defaultValue: string): string {
    const translation = this.translate.instant(key);
    return translation !== key ? translation : defaultValue;
  }

  ngOnInit() {
    this.loadSections();
  }

 removeFile(type: 'main' | 'hero' | 'video' | 'pdf') {
    this.state.fileInputs[type] = null;
    if (type === 'main' || type === 'hero') {
      this.state.filePreviews[type] = null;
    }
    
    if (type === 'main') this.state.currentSection.imageUrl = '';
    if (type === 'hero') this.state.currentSection.heroImageUrl = '';
    if (type === 'video') this.state.currentSection.videoUrl = '';
    if (type === 'pdf') this.state.currentSection.pdfUrl = '';
  }

  // ========== URL Handling Methods ==========
private isExternalUrl(url: string): boolean {
  if (!url) return false;
  // تتضمن الآن الروابط التي تبدأ بـ / أو http أو https أو www
  return /^(https?:\/\/|\/|www\.)/i.test(url);
}
private isYouTubeUrl(url: string): boolean {
  return /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)/i.test(url);
}


  private isVimeoUrl(url: string): boolean {
    return /vimeo\.com/i.test(url);
  }

getFullFileUrl(path: string): string {
  if (!path) return '';
  
  if (this.isExternalUrl(path)) {
    // إذا كان الرابط يبدأ بـ / فهو رابط محلي
    if (path.startsWith('/')) {
      const baseUrl = environment.apiUrl.replace('/api', '');
      return `${baseUrl}${path}`;
    }
    // إذا كان رابط خارجي
    return path.startsWith('www.') ? `https://${path}` : path;
  }
  
  // الروابط الأخرى (النسبية)
  const baseUrl = environment.apiUrl.replace('/api', '');
  return `${baseUrl}/${path}`;
}

 getSafeVideoUrl(url: string): SafeResourceUrl {
  if (!url) return '';
  
  if (this.isYouTubeUrl(url)) {
    const videoId = this.extractYouTubeId(url);
    if (videoId) {
      const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    }
  }
  
  if (this.isVimeoUrl(url)) {
    const videoId = url.split('vimeo.com/')[1].split('?')[0];
    if (videoId) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://player.vimeo.com/video/${videoId}`
      );
    }
  }
  
  // إذا كان رابط محلي أو غير معروف
  return this.sanitizer.bypassSecurityTrustResourceUrl(this.getFullFileUrl(url));
}
  private extractYouTubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  // ========== URL Handling Methods ==========

  // ========== Data Handling Methods ==========
   private transformIncomingData(apiData: any): Section {
    const videoUrl = apiData.VideoUrl || '';
    const transformedVideoUrl = this.isExternalUrl(videoUrl) ? videoUrl : this.getFullFileUrl(videoUrl);

    return {
      id: apiData.Id,
      title: apiData.Title,
      titleAr: apiData.TitleAr || '',
      sectionType: apiData.SectionType as SectionType,
      description: apiData.Description || '',
      descriptionAr: apiData.DescriptionAr || '',
      content: apiData.Content || '',
      contentAr: apiData.ContentAr || '',
      imageUrl: this.getFullFileUrl(apiData.ImageUrl || ''),
      heroImageUrl: this.getFullFileUrl(apiData.HeroImageUrl || ''),
      videoUrl: transformedVideoUrl,
      pdfUrl: this.getFullFileUrl(apiData.PdfUrl || ''),
      order: apiData.Order || 0,
      isActive: apiData.IsActive ?? true,
      showInHomePage: apiData.ShowInHomePage ?? false,
      isHeroSection: apiData.IsHeroSection ?? false,
      createdAt: new Date(apiData.CreatedAt),
      updatedAt: new Date(apiData.UpdatedAt),
      issn: apiData.ISSN || '',
      volume: apiData.Volume || null,
      issue: apiData.Issue || null,
      publicationDate: apiData.PublicationDate ? new Date(apiData.PublicationDate) : null,
      address: apiData.Address || '',
      addressAr: apiData.AddressAr || '',
      phone: apiData.Phone || '',
      email: apiData.Email || '',
      workingHours: apiData.WorkingHours || '',
      workingHoursAr: apiData.WorkingHoursAr || '',
      mapEmbedUrl: apiData.MapEmbedUrl || '',
      position: apiData.Position || '',
      positionAr: apiData.PositionAr || '',
      websiteUrl: apiData.WebsiteUrl || '',
      partnerType: apiData.PartnerType as PartnerType || null
    };
  }


 private prepareFormData(): FormData {
  const formData = new FormData();
  const section = { ...this.state.currentSection };

  // إنشاء نسخة من البيانات بدون الحقول التي سنتعامل معها بشكل منفصل
  const { videoUrl, imageUrl, heroImageUrl, pdfUrl, createdAt, updatedAt, ...sectionData } = section;

  // معالجة رابط الفيديو
  let finalVideoUrl = '';
  if (this.state.fileInputs.video) {
    // إذا كان هناك ملف فيديو يتم رفعه، نتجاهل الرابط
    finalVideoUrl = '';
  } else if (videoUrl) {
    // إذا كان رابط خارجي (يوتيوب/فيميو) نبقيه كما هو
    if (this.isYouTubeUrl(videoUrl) || this.isVimeoUrl(videoUrl)) {
      finalVideoUrl = videoUrl;
    } else {
      // إذا كان رابط محلي، نزيل عنوان الخادم الأساسي إن وجد
      const baseUrl = environment.apiUrl.replace('/api', '');
      finalVideoUrl = videoUrl.replace(baseUrl, '');
    }
  }

  // إعداد بيانات القسم للإرسال
  const dataToSend = {
    ...sectionData,
    videoUrl: finalVideoUrl,
    imageUrl: imageUrl?.replace(environment.apiUrl.replace('/api', ''), '') || '',
    heroImageUrl: heroImageUrl?.replace(environment.apiUrl.replace('/api', ''), '') || '',
    pdfUrl: pdfUrl?.replace(environment.apiUrl.replace('/api', ''), '') || '',
    publicationDate: section.publicationDate?.toISOString() || null,
    createdAt: section.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  formData.append('section', JSON.stringify(dataToSend));

  // إضافة الملفات إذا وجدت
  if (this.state.fileInputs.main) {
    formData.append('MainImage', this.state.fileInputs.main);
  }
  if (this.state.fileInputs.hero) {
    formData.append('HeroImage', this.state.fileInputs.hero);
  }
  if (this.state.fileInputs.video) {
    formData.append('VideoFile', this.state.fileInputs.video);
  }
  if (this.state.fileInputs.pdf) {
    formData.append('PdfFile', this.state.fileInputs.pdf);
  }

  return formData;
}


  // ========== Form Submission ==========
  validateYouTubeUrl(url: string): boolean {
    if (!url) return true;
    if (!this.isYouTubeUrl(url) && !this.isVimeoUrl(url)) {
      this.toastr.warning('Please enter a valid YouTube or Vimeo URL', 'Invalid URL');
      return false;
    }
    return true;
  }
validateVideoUrl(url: string): boolean {
  if (!url) return true;
  
  // قبول أي رابط يبدأ بـ http أو https أو / أو www
  if (/^(https?:\/\/|\/|www\.)/i.test(url)) {
    return true;
  }
  
  this.toastr.warning('Please enter a valid video URL starting with http://, https://, /, or www.', 'Invalid URL');
  return false;
}
  // ========== UI Methods ==========
 getTabs(): Tab[] {
    const tabs: Tab[] = [
      { id: 'info', label: 'BASIC_INFO', icon: this.icons.info, translationKey: 'MANAGE_SECTIONS.TABS.BASIC_INFO' },
      { id: 'content', label: 'CONTENT', icon: this.icons.align, translationKey: 'MANAGE_SECTIONS.TABS.CONTENT' },
      { id: 'images', label: 'MEDIA', icon: this.icons.images, translationKey: 'MANAGE_SECTIONS.TABS.MEDIA' }
    ];

    if (this.shouldShowSpecificTab()) {
      tabs.push({
        id: 'specific', 
        label: this.getSpecificTabName(), 
        icon: this.getSpecificTabIcon(),
        translationKey: this.getSpecificTabTranslationKey()
      });
    }

    return tabs;
  }

  public getSpecificTabTranslationKey(): string {
    switch(this.state.currentSection.sectionType) {
      case SectionType.SadaARIDJournal: return 'MANAGE_SECTIONS.TABS.JOURNAL_DETAILS';
      case SectionType.ContactUs: return 'MANAGE_SECTIONS.TABS.CONTACT_INFO';
      case SectionType.HigherManagement: return 'MANAGE_SECTIONS.TABS.POSITION';
      case SectionType.OurPartners: return 'MANAGE_SECTIONS.TABS.PARTNER_INFO';
      default: return 'MANAGE_SECTIONS.TABS.DETAILS';
    }
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

  // ========== CRUD Operations ==========
  loadSections() {
    this.sectionService.getAllSections().subscribe({
      next: (sections) => {
        this.state.sections = sections.map(s => this.transformIncomingData(s));
        this.filterSections();
      },
      error: (err) => this.showError('Failed to load sections', err)
    });
  }

submitForm(sectionForm: NgForm) {
  if (sectionForm.invalid || this.state.isSubmitting) return;

  // تحقق إضافي من رابط الفيديو
  if (this.state.currentSection.videoUrl) {
    const videoUrl = this.state.currentSection.videoUrl.trim();
    if (!this.isYouTubeUrl(videoUrl) && !this.isVimeoUrl(videoUrl)) {
      this.toastr.warning('Please enter a valid YouTube or Vimeo URL', 'Invalid URL');
      return;
    }
    this.state.currentSection.videoUrl = videoUrl;
  }

  this.state.isSubmitting = true;
  const formData = this.prepareFormData();

  // تسجيل البيانات قبل الإرسال للتأكد
  console.log('Final Video URL to send:', this.state.currentSection.videoUrl);
  console.log('FormData section:', formData.get('section'));

  const request = this.state.isEditing
    ? this.sectionService.updateSectionWithFiles(this.state.currentSection.id, formData)
    : this.sectionService.addSectionWithFiles(formData);

  request.subscribe({
    next: (response) => {
      console.log('Server response:', response); // تسجيل استجابة الخادم
      this.handleSuccess();
    },
    error: (err) => {
      console.error('Error response:', err); // تسجيل تفاصيل الخطأ
      this.handleError(err);
    }
  });
    console.log('Sending video URL:', this.state.currentSection.videoUrl);
console.log('FormData content:', formData.get('section'));
  }

  deleteSection(id: number) {
    if (confirm('Are you sure you want to delete this section? This action cannot be undone.')) {
      this.state.loadingStates[id] = true;
      
      this.sectionService.deleteSection(id).subscribe({
        next: () => {
          this.showSuccess('Section deleted successfully');
          this.loadSections();
          this.state.loadingStates[id] = false;
        },
        error: (err) => {
          this.showError('Failed to delete section', err);
          this.state.loadingStates[id] = false;
        }
      });
    }
  }

  // ========== Modal & File Handling ==========
  openAddModal() {
    this.resetFormState();
    this.state.showModal = true;
  }

  openEditModal(section: Section) {
    this.state.loadingStates[section.id] = true;
    
    this.sectionService.getSectionById(section.id).subscribe({
      next: (updatedSection) => {
        this.state.currentSection = this.transformIncomingData(updatedSection);
        this.state.isEditing = true;
        this.resetFilePreviews();
        this.state.showModal = true;
        this.state.loadingStates[section.id] = false;
      },
      error: (err) => {
        this.showError('Failed to load section details', err);
        this.state.loadingStates[section.id] = false;
      }
    });
  }

  onFileSelected(event: Event, type: 'main' | 'hero' | 'video' | 'pdf') {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (file.size > this.maxFileSize) {
      this.showWarning('File size should be less than 5MB');
      return;
    }

    this.state.fileInputs[type] = file;
    
    if (type === 'video') {
      this.state.currentSection.videoUrl = '';
    }
    
    if (type === 'main' || type === 'hero') {
      const reader = new FileReader();
      reader.onload = () => {
        this.state.filePreviews[type] = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // ========== Utility Methods ==========
  private createEmptySection(): Section {
    return {
      id: 0,
      title: '',
      titleAr: '',
      sectionType: SectionType.HomePage,
      description: '',
      descriptionAr: '',
      content: '',
      contentAr: '',
      imageUrl: '',
      heroImageUrl: '',
      videoUrl: '',
      pdfUrl: '',
      order: 0,
      isActive: true,
      showInHomePage: true,
      isHeroSection: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      issn: '',
      volume: null,
      issue: null,
      publicationDate: null,
      address: '',
      addressAr: '',
      phone: '',
      email: '',
      workingHours: '',
      workingHoursAr: '',
      mapEmbedUrl: '',
      position: '',
      positionAr: '',
      websiteUrl: '',
      partnerType: null
    };
  }

  private resetFormState() {
    this.state.currentSection = this.createEmptySection();
    this.resetFilePreviews();
    this.state.currentTab = 'info';
    this.state.isEditing = false;
    this.state.isSubmitting = false;
  }

  private resetFilePreviews() {
    this.state.fileInputs = {
      main: null,
      hero: null,
      video: null,
      pdf: null
    };
    this.state.filePreviews = {
      main: null,
      hero: null
    };
  }

  private handleSuccess() {
    this.showSuccess(`Section ${this.state.isEditing ? 'updated' : 'added'} successfully`);
    this.loadSections();
    this.closeModal();
    this.resetFormState();
  }

  private handleError(error: any) {
    console.error('Operation failed:', error);
    this.state.isSubmitting = false;
    this.showError(
      `Failed to ${this.state.isEditing ? 'update' : 'add'} section`, 
      error.error?.message || error.message
    );
  }

  private showSuccess(message: string) {
    this.toastr.success(message, 'Success');
  }

  private showError(message: string, error?: any) {
    console.error(message, error);
    this.toastr.error(message, 'Error');
  }

  private showWarning(message: string) {
    this.toastr.warning(message, 'Warning');
  }

  // ========== Navigation Methods ==========
  nextTab() {
    const tabs: TabType[] = ['info', 'content', 'images', 'specific'];
    const currentIndex = tabs.indexOf(this.state.currentTab);
    if (currentIndex < tabs.length - 1) {
      this.state.currentTab = tabs[currentIndex + 1];
    }
  }

  prevTab() {
    const tabs: TabType[] = ['info', 'content', 'images', 'specific'];
    const currentIndex = tabs.indexOf(this.state.currentTab);
    if (currentIndex > 0) {
      this.state.currentTab = tabs[currentIndex - 1];
    }
  }

  setCurrentTab(tabId: TabType) {
    this.state.currentTab = tabId;
  }

  closeModal() {
    this.state.showModal = false;
    this.state.isSubmitting = false;
  }

  filterByType(type: SectionType | 'all') {
    this.state.currentFilter = type;
    this.filterSections();
  }

  filterSections() {
    this.state.filteredSections = this.state.currentFilter === 'all' 
      ? [...this.state.sections] 
      : this.state.sections.filter(s => s.sectionType === this.state.currentFilter);
  }

  shouldShowSpecificTab(): boolean {
    return [
      SectionType.SadaARIDJournal,
      SectionType.ContactUs,
      SectionType.HigherManagement,
      SectionType.OurPartners
    ].includes(this.state.currentSection.sectionType);
  }

  getSpecificTabIcon() {
    switch(this.state.currentSection.sectionType) {
      case SectionType.SadaARIDJournal: return this.icons.newspaper;
      case SectionType.ContactUs: return this.icons.globe;
      case SectionType.HigherManagement: return this.icons.userTie;
      case SectionType.OurPartners: return this.icons.handshake;
      default: return this.icons.info;
    }
  }

  getSpecificTabName(): string {
    switch(this.state.currentSection.sectionType) {
      case SectionType.SadaARIDJournal: return 'Journal Details';
      case SectionType.ContactUs: return 'Contact Info';
      case SectionType.HigherManagement: return 'Position';
      case SectionType.OurPartners: return 'Partner Info';
      default: return 'Details';
    }
  }

  onSectionTypeChange() {
    if (this.state.currentSection.sectionType !== SectionType.HomePage) {
      this.state.currentSection.imageUrl = '';
      this.state.fileInputs.main = null;
      this.state.filePreviews.main = null;
    }
  }
}