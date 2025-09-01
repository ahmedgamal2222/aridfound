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


  currentSlIde = 0;
  slIdes: any[] = [];
  isBrowser: boolean;
  private resizeObserver: ResizeObserver | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private translate: TranslateService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.initSlIder();
    if (this.isBrowser) {
      this.setupResizeObserver();
    }
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private initSlIder(): void {
    // Group partners into slIdes based on items per slIde
    const itemsPerSlIde = this.calculateItemsPerSlIde();
    this.slIdes = this.chunkArray(this.partners, itemsPerSlIde);
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.initSlIder();
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

  calculateItemsPerSlIde(): number {
    if (!this.isBrowser) return 4;
    
    const wIdth = window.innerWidth;
    if (wIdth > 1400) return 4;
    if (wIdth > 1024) return 3;
    if (wIdth > 768) return 2;
    return 1;
  }

  getFullImageUrl(relativePath: string | undefined): string {
    if (!relativePath) return '';
    if (relativePath.startsWith('http')) return relativePath;
    const baseUrl = 'https://arIdfound.premiumasp.net'; // Replace with your API base Url
    return relativePath.startsWith('/') ? `${baseUrl}${relativePath}` : `${baseUrl}/${relativePath}`;
  }


  prevSlIde(): void {
    this.currentSlIde = (this.currentSlIde - 1 + this.slIdes.length) % this.slIdes.length;
  }

  nextSlIde(): void {
    this.currentSlIde = (this.currentSlIde + 1) % this.slIdes.length;
  }

  goToSlIde(index: number): void {
    this.currentSlIde = index;
  }

  get slIderHeight(): string {
    if (this.slIdes.length === 0) return 'auto';
    const itemsInFirstSlIde = this.slIdes[0].length;
    if (itemsInFirstSlIde <= 2) return '400px';
    if (itemsInFirstSlIde <= 4) return '350px';
    return '300px';
  }
}