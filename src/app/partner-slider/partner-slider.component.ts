import { Component, Input, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { Section } from '../core/models/section.model';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { TruncatePipe } from "../../truncate.pipe";
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-partner-slider',
  standalone: true,
  imports: [CommonModule, CarouselModule,TruncatePipe, TranslateModule],
  templateUrl: './partner-slider.component.html',
  styleUrls: ['./partner-slider.component.css']
})
export class PartnerSliderComponent implements OnInit, OnDestroy {
  @Input() partners: Section[] = [];
  @Input() autoPlay: boolean = true;
  @Input() interval: number = 5000;
  
  // Font Awesome icons


  currentSlide = 0;
  slides: any[] = [];
  isBrowser: boolean;
  private resizeObserver: ResizeObserver | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private translate: TranslateService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.initSlider();
    if (this.isBrowser) {
      this.setupResizeObserver();
    }
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private initSlider(): void {
    // Group partners into slides based on items per slide
    const itemsPerSlide = this.calculateItemsPerSlide();
    this.slides = this.chunkArray(this.partners, itemsPerSlide);
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.initSlider();
      });
      
      const container = document.querySelector('.partners-container');
      if (container) {
        this.resizeObserver.observe(container);
      }
    }
  }

  private chunkArray(array: any[], size: number): any[] {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  }

  calculateItemsPerSlide(): number {
    if (!this.isBrowser) return 4;
    
    const width = window.innerWidth;
    if (width > 1400) return 4;
    if (width > 1024) return 3;
    if (width > 768) return 2;
    return 1;
  }

  getFullImageUrl(relativePath: string | undefined): string {
    if (!relativePath) return '';
    if (relativePath.startsWith('http')) return relativePath;
    const baseUrl = 'https://aridfound.premiumasp.net'; // Replace with your API base URL
    return relativePath.startsWith('/') ? `${baseUrl}${relativePath}` : `${baseUrl}/${relativePath}`;
  }


  prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
  }

  get sliderHeight(): string {
    if (this.slides.length === 0) return 'auto';
    const itemsInFirstSlide = this.slides[0].length;
    if (itemsInFirstSlide <= 2) return '400px';
    if (itemsInFirstSlide <= 4) return '350px';
    return '300px';
  }
}