import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Section } from '../core/models/section.model';
import { RouterLink } from '@angular/router';
import { TruncatePipe } from '../../truncate.pipe';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, RouterLink, TruncatePipe, TranslateModule],
  template: `
    <div class="card h-100 shadow-sm">
      <img [src]="getSafeImageUrl(section.imageUrl)" 
           class="card-img-top" 
           [alt]="section.title"
           onerror="this.style.display='none'">
      <div class="card-body">
        <h5 class="card-title">{{section.title}}</h5>
        <p class="card-text text-muted">{{section.description || '' | truncate: 120}}</p>
      </div>
      <div class="card-footer bg-transparent">
        <a [routerLink]="['/sections', section.id]" class="btn btn-sm btn-outline-primary">
          {{ 'CARD.VIEW_DETAILS' | translate }}
        </a>
      </div>
    </div>
  `,
  styles: [`
    .card {
      transition: transform 0.3s, box-shadow 0.3s;
      border: none;
    }
    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    }
    .card-img-top {
      height: 180px;
      object-fit: cover;
      background-color: #f8f9fa;
    }
  `]
})
export class CardComponent {
  @Input() section!: Section;
  defaultImage = 'assets/images/default-section.jpg';

  getSafeImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `https://aridfound.premiumasp.net${imageUrl}`;
  }

  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = this.defaultImage;
    img.style.opacity = '0.8';
  }
}