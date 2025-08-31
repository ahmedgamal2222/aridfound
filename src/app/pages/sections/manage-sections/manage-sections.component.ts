import { Component, OnInit } from '@angular/core';
import { SectionService } from '../../../core/services/section.service';
import { Section, SectionContent, ViewType } from '../../../core/models/section.model';
import { ToastrService } from 'ngx-toastr';
import { FormsModule, NgForm } from '@angular/forms';
import { ModalComponent } from '../../../modal/modal.component';
import { environment } from '../../../core/environments/environment';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faPlus, faEdit, faTrash, faArrowLeft, 
  faArrowRight, faImage, faLayerGroup, 
  faInfoCircle, faAlignLeft, faImages,
  faVideo, faLink, faHome, faBars, faWindowMinimize
} from '@fortawesome/free-solid-svg-icons';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TruncatePipe } from "../../../../truncate.pipe";
import { ConfirmDialogComponent } from "../../../confirm-dialog/confirm-dialog.component";
import { AuthService } from '../../../core/services/auth.service';

type TabType = 'info' | 'content';

interface Tab {
  Id: TabType;
  label: string;
  icon: any;
}

interface AppState {
  sections: Section[];
  filteredSections: Section[];
  loading: boolean;
  isSubmitting: boolean;
  showModal: boolean;
  isEditing: boolean;
  currentTab: TabType;
  currentSection: Section;
  currentContent: Partial<SectionContent>;
  fileInputs: {
    Image: File | null;
    contentImage: File | null;
  };
  filePreviews: {
    Image: string | null;
    contentImage: string | null;
  };
  searchTerm: string;
  activeFilter: 'all' | 'active' | 'inactive';
  typeFilter: ViewType | 'all';
}

@Component({
  selector: 'app-manage-sections',
  standalone: true,
  imports: [
    FormsModule, 
    CommonModule, 
    TranslateModule, 
    FontAwesomeModule, 
    ModalComponent,
    TruncatePipe,
    ConfirmDialogComponent,
  ],
  templateUrl: './manage-sections.component.html',
  styleUrls: ['./manage-sections.component.css']
})
export class ManageSectionsComponent implements OnInit {
  // Icons
  icons = {
    plus: faPlus,
    edit: faEdit,
    trash: faTrash,
    left: faArrowLeft,
    right: faArrowRight,
    Image: faImage,
    layers: faLayerGroup,
    info: faInfoCircle,
    align: faAlignLeft,
    Images: faImages,
    vIdeo: faVideo,
    link: faLink,
    home: faHome,
    menu: faBars,
    footer: faWindowMinimize
  };
  
  languages: any[] = [];
  
  // Tabs configuration
  tabs: Tab[] = [
    { Id: 'info', label: 'MANAGE_SECTIONS.TABS.INFO', icon: this.icons.info },
    { Id: 'content', label: 'MANAGE_SECTIONS.TABS.CONTENT', icon: this.icons.align }
  ];

  // State
  state: AppState = {
    sections: [],
    filteredSections: [],
    loading: false,
    isSubmitting: false,
    showModal: false,
    isEditing: false,
    currentTab: 'info',
    currentSection: this.createEmptySection(),
    currentContent: this.createEmptyContent(),
    fileInputs: {
      Image: null,
      contentImage: null
    },
    filePreviews: {
      Image: null,
      contentImage: null
    },
    searchTerm: '',
    activeFilter: 'all',
    typeFilter: 'all'
  };

  // Constants
  readonly ViewTypes = Object.values(ViewType);
  readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  showConfirmDialog = false;
  confirmAction: 'deleteSection' | 'deleteContent' | null = null;
  itemToDelete: any = null;

  constructor(
    private sectionService: SectionService,
    private toastr: ToastrService,
    private sanitizer: DomSanitizer,
    private translate: TranslateService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadSections();
    this.loadLanguages();
  }
  
  loadLanguages(): void {
    this.sectionService.getLanguages().subscribe({
      next: (langs) => {
        this.languages = langs;
      },
      error: (err) => {
        console.error('Failed to load languages', err);
        this.showError('MANAGE_SECTIONS.ERRORS.LOAD_LANGUAGES');
      }
    });
  }
  
  // ========== Data Loading ==========
  loadSections(): void {
    this.state.loading = true;
    this.sectionService.getAllSections().subscribe({
      next: (sections) => {
        // تحويل undefined إلى null للتوافق مع TypeScript
        this.state.sections = sections.map(section => ({
          ...section,
          LanguageId: section.LanguageId === undefined ? null : section.LanguageId,
          Contents: section.Contents?.map(content => ({
            ...content,
            LanguageId: content.LanguageId === undefined ? null : content.LanguageId
          })) || []
        }));
        this.applyFilters();
        this.state.loading = false;
      },
      error: (err) => {
        this.showError('MANAGE_SECTIONS.ERRORS.LOAD_SECTIONS', err);
        this.state.loading = false;
      }
    });
  }

  // ========== CRUD Operations ==========
  createSection(sectionForm: NgForm): void {
    console.log('Form values:', sectionForm.value);
    console.log('Current section object:', this.state.currentSection);
    
    if (sectionForm.invalid || this.state.isSubmitting) return;

    this.state.isSubmitting = true;
    const sectionData = this.prepareSectionData();

    const request = this.state.isEditing 
      ? this.sectionService.updateSection(this.state.currentSection.Id, sectionData)
      : this.sectionService.createSection(sectionData);

    request.subscribe({
      next: (section) => {
        // تحويل undefined إلى null للتوافق مع TypeScript
        const processedSection = {
          ...section,
          LanguageId: section.LanguageId === undefined ? null : section.LanguageId,
          Contents: section.Contents?.map(content => ({
            ...content,
            LanguageId: content.LanguageId === undefined ? null : content.LanguageId
          })) || []
        };

        this.showSuccess('MANAGE_SECTIONS.SUCCESS.SECTION_SAVED');
        this.state.currentSection = processedSection;
        this.loadSections();
        this.state.currentTab = 'content';
        this.state.isSubmitting = false;
      },
      error: (err) => {
        this.showError('MANAGE_SECTIONS.ERRORS.SAVE_SECTION', err);
        this.state.isSubmitting = false;
      }
    });
  }
  
  deleteSection(Id: number): void {
    this.confirmAction = 'deleteSection';
    this.itemToDelete = Id;
    this.showConfirmDialog = true;
  }

  confirmDelete(): void {
    if (!this.confirmAction || !this.itemToDelete) return;

    if (this.confirmAction === 'deleteSection') {
      this.sectionService.deleteSection(this.itemToDelete).subscribe({
        next: () => {
          this.showSuccess('MANAGE_SECTIONS.SUCCESS.SECTION_DELETED');
          this.loadSections();
        },
        error: (err) => this.showError('MANAGE_SECTIONS.ERRORS.DELETE_SECTION', err)
      });
    } else if (this.confirmAction === 'deleteContent') {
      this.sectionService.deleteContent(this.itemToDelete).subscribe({
        next: () => {
          this.showSuccess('MANAGE_SECTIONS.SUCCESS.CONTENT_DELETED');
          // إعادة تحميل محتويات القسم
          this.state.currentSection.Contents = this.state.currentSection.Contents.filter(
            c => c.Id !== this.itemToDelete
          );
        },
        error: (err) => this.showError('MANAGE_SECTIONS.ERRORS.DELETE_CONTENT', err)
      });
    }

    this.resetConfirmation();
  }

  // ========== Content Management ==========
  async addContent(): Promise<void> {
    if (!this.state.currentContent.Subject || !this.state.currentContent.Content) {
      this.showError('MANAGE_SECTIONS.ERRORS.REQUIRED_FIELDS');
      return;
    }

    try {
      const contentData: Partial<SectionContent> = {
        ...this.state.currentContent,
        SectionId: this.state.currentSection.Id,
        Url: this.state.currentContent.Url || undefined,
        Image: this.state.fileInputs.contentImage 
          ? await this.fileToBase64(this.state.fileInputs.contentImage) 
          : undefined,
        LanguageId: this.state.currentContent.LanguageId === null ? undefined : this.state.currentContent.LanguageId
      };

      const request = this.state.currentContent.Id
        ? this.sectionService.updateContent(this.state.currentContent.Id as number, contentData)
        : this.sectionService.addContent(contentData);

      request.subscribe({
        next: (content) => {
          // تحويل undefined إلى null للتوافق مع TypeScript
          const processedContent = {
            ...content,
            LanguageId: content.LanguageId === undefined ? null : content.LanguageId
          };

          this.showSuccess('MANAGE_SECTIONS.SUCCESS.CONTENT_SAVED');
          
          // تحديث قائمة المحتويات
          if (this.state.currentContent.Id) {
            const index = this.state.currentSection.Contents.findIndex(c => c.Id === processedContent.Id);
            if (index !== -1) {
              this.state.currentSection.Contents[index] = processedContent;
            }
          } else {
            this.state.currentSection.Contents.push(processedContent);
          }
          
          this.state.currentContent = this.createEmptyContent();
          this.removeFile('contentImage');
        },
        error: (err) => this.showError('MANAGE_SECTIONS.ERRORS.SAVE_CONTENT', err)
      });
    } catch (error) {
      this.showError('MANAGE_SECTIONS.ERRORS.FILE_UPLOAD', error);
    }
  }
  
  deleteContent(contentId: number): void {
    this.confirmAction = 'deleteContent';
    this.itemToDelete = contentId;
    this.showConfirmDialog = true;
  }

  // ========== Helper Methods ==========
  private prepareSectionData(): Partial<Section> {
    const section = { ...this.state.currentSection };
    
    console.log('LanguageId before processing:', section.LanguageId);
    
    // معالجة LanguageId بشكل صريح
    if (section.LanguageId === null || section.LanguageId === undefined || section.LanguageId === 0) {
      section.LanguageId = null;
    } else {
      // تحقق من أن القيمة رقمية
      section.LanguageId = Number(section.LanguageId);
      if (isNaN(section.LanguageId)) {
        section.LanguageId = null;
      }
    }
    
    console.log('LanguageId after processing:', section.LanguageId);
    
    return {
      ...section,
      ViewType: section.ViewType || ViewType.HtmlBlock
    };
  }
  
  onLanguageChange(event: any): void {
    const value = event.target.value;
    console.log('Selected language value (raw):', value);

    const parsedValue = parseInt(value, 10);

    if (isNaN(parsedValue)) {
      this.state.currentSection.LanguageId = null;
    } else {
      this.state.currentSection.LanguageId = parsedValue;
    }

    console.log('Current section LanguageId:', this.state.currentSection.LanguageId);
  }

  private createEmptySection(): Section {
    return {
      Id: 0,
      Name: '',
      Indx: 0,
      IsMenu: false,
      IsHomePage: false,
      IsFooter: false,
      ViewType: ViewType.HtmlBlock,
      LanguageId: null, // استخدام null بدلاً من 1
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
      Contents: []
    };
  }

  private createEmptyContent(): Partial<SectionContent> {
    return {
      Subject: '',
      Content: '',
      Order: 0,
      IsActive: true,
      Url: '',
      LanguageId: null // استخدام null بدلاً من undefined
    };
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  // ========== UI Methods ==========
  openAddModal(): void {
    this.state.currentSection = this.createEmptySection();
    this.state.isEditing = false;
    this.state.currentTab = 'info';
    this.state.showModal = true;
    this.resetFileInputs();
  }

  openEditModal(section: Section): void {
    this.state.currentSection = {...section};
    this.state.isEditing = true;
    this.state.currentTab = 'info';
    this.state.showModal = true;
    this.resetFileInputs();
  }

  closeModal(): void {
    this.state.showModal = false;
    this.state.isSubmitting = false;
    this.resetFileInputs();
  }

  // ========== Tab Navigation Methods ==========
  nextTab(): void {
    const currentIndex = this.tabs.findIndex(tab => tab.Id === this.state.currentTab);
    if (currentIndex < this.tabs.length - 1) {
      this.state.currentTab = this.tabs[currentIndex + 1].Id;
    }
  }

  prevTab(): void {
    const currentIndex = this.tabs.findIndex(tab => tab.Id === this.state.currentTab);
    if (currentIndex > 0) {
      this.state.currentTab = this.tabs[currentIndex - 1].Id;
    }
  }

  // ========== Content Management Methods ==========
  addNewContent(): void {
    this.state.currentContent = this.createEmptyContent();
    this.removeFile('contentImage');
  }

  editContent(content: SectionContent): void {
    this.state.currentContent = { ...content };
    if (content.Image) {
      this.state.filePreviews.contentImage = this.getFullFileUrl(content.Image);
    }
  }

  cancelContentEdit(): void {
    this.state.currentContent = this.createEmptyContent();
    this.removeFile('contentImage');
  }

  // ========== Filter Methods ==========
  applyFilters(): void {
    this.state.filteredSections = this.state.sections.filter(section => {
      // Search filter
      const matchesSearch = !this.state.searchTerm || 
        section.Name.toLowerCase().includes(this.state.searchTerm.toLowerCase()) ||
        section.Id.toString().includes(this.state.searchTerm);

      // Type filter
      const matchesType = this.state.typeFilter === 'all' || 
        section.ViewType === this.state.typeFilter;

      return matchesSearch && matchesType;
    });

    // Sort by index
    this.state.filteredSections.sort((a, b) => a.Indx - b.Indx);
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  // ========== UI Helper Methods ==========
  getTabIcon(tabId: TabType): any {
    const tab = this.tabs.find(t => t.Id === tabId);
    return tab ? tab.icon : this.icons.info;
  }

  // ========== دالة جديدة لعرض الصور المشفرة بـ Base64 ==========
  getFullFileUrl(fileName: string): string {
    if (!fileName) return '';
    
    // إذا كانت الصورة مشفرة بـ Base64
    if (fileName.startsWith('data:image/')) {
      return fileName;
    }
    
    // إذا كان المسار يحتوي على عنوان URL كامل بالفعل
    if (fileName.startsWith('http')) return fileName;
    
    // إذا كان المسار يبدأ بـ uploads/
    if (fileName.startsWith('uploads/') || fileName.startsWith('/uploads/')) {
      const cleanPath = fileName.startsWith('/') ? fileName.substring(1) : fileName;
      return `${environment.apiUrl}/${cleanPath}`;
    }
    
    // إذا كان المسار يبدأ مباشرة بـ sections/
    if (fileName.startsWith('sections/') || fileName.startsWith('/sections/')) {
      const cleanPath = fileName.startsWith('/') ? fileName.substring(1) : fileName;
      return `${environment.apiUrl}/uploads/${cleanPath}`;
    }
    
    // للمسارات الأخرى
    const baseUrl = environment.apiUrl.replace('/api', '');
    return fileName.startsWith('/') ? `${baseUrl}${fileName}` : `${baseUrl}/${fileName}`;
  }

  getSafeVideoUrl(url: string): SafeResourceUrl {
    if (!url) return this.sanitizer.bypassSecurityTrustResourceUrl('');

    // Convert YouTube url to embed format
    if (url.includes('youtube.com/watch?v=')) {
      url = url.replace('youtube.com/watch?v=', 'youtube.com/embed/');
    } else if (url.includes('youtu.be/')) {
      url = url.replace('youtu.be/', 'youtube.com/embed/');
    } else if (url.includes('vimeo.com/')) {
      url = url.replace('vimeo.com/', 'player.vimeo.com/video/');
    }
    
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // ========== File Handling ==========
  onFileSelected(event: Event, type: 'Image' | 'contentImage'): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (file.size > this.maxFileSize) {
      this.showWarning('MANAGE_SECTIONS.WARNINGS.FILE_SIZE');
      return;
    }

    this.state.fileInputs[type] = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.state.filePreviews[type] = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeFile(type: 'Image' | 'contentImage'): void {
    this.state.fileInputs[type] = null;
    this.state.filePreviews[type] = null;
    const inputs = document.querySelectorAll(`input[type="file"][accept="image/*"]`) as NodeListOf<HTMLInputElement>;
    inputs.forEach(input => input.value = '');
  }

  private resetFileInputs(): void {
    this.state.fileInputs = {
      Image: null,
      contentImage: null
    };
    this.state.filePreviews = {
      Image: null,
      contentImage: null
    };
  }

  public resetConfirmation(): void {
    this.showConfirmDialog = false;
    this.confirmAction = null;
    this.itemToDelete = null;
  }

  // ========== Notification Methods ==========
  private showSuccess(message: string): void {
    this.toastr.success(this.translate.instant(message));
  }

  private showError(message: string, error?: any): void {
    console.error(message, error);
    this.toastr.error(this.translate.instant(message));
  }

  private showWarning(message: string): void {
    this.toastr.warning(this.translate.instant(message));
  }

  // ========== Role Check ==========
  // يمكنك إضافة دوال التحقق من الصلاحيات هنا إذا لزم الأمر
}