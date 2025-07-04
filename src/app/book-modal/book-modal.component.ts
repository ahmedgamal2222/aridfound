import { Component, OnInit } from '@angular/core';
import { Section } from '../core/models/section.model';
import { CommonModule } from '@angular/common';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-book-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">{{book?.title}}</h4>
      <button type="button" class="btn-close" (click)="bsModalRef.hide()"
              [attr.aria-label]="'MODAL.CLOSE' | translate"></button>
    </div>
    <div class="modal-body">
      <div class="row">
        <div class="col-md-4">
          <img [src]="getFullImageUrl(book?.imageUrl)" 
               [alt]="book?.title" 
               class="img-fluid rounded shadow mb-3">
        </div>
        <div class="col-md-8">
          <div [innerHTML]="book?.content"></div>
          <div *ngIf="book?.description" class="mt-3">
            <p>{{book?.description}}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button *ngIf="book?.pdfUrl" 
              class="btn btn-primary" 
              (click)="downloadPdf()">
        <i class="fas fa-download me-2"></i>{{ 'BOOK.DOWNLOAD_PDF' | translate }}
      </button>
      <button type="button" class="btn btn-secondary" (click)="bsModalRef.hide()">
        {{ 'COMMON.CLOSE' | translate }}
      </button>
    </div>
  `,
  styles: [`
    .modal-header {
      background-color: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
    }
    .modal-title {
      color: #343a40;
    }
  `]
})
export class BookModalComponent implements OnInit {
  book?: Section;

  constructor(
    public bsModalRef: BsModalRef,
    private translate: TranslateService
  ) {}


  ngOnInit() {}

  getFullImageUrl(relativePath: string | undefined): string {
    if (!relativePath) return '';
    if (relativePath.startsWith('http')) return relativePath;
    const baseUrl = 'https://aridfound.premiumasp.net'; // Replace with your API base URL
    return relativePath.startsWith('/') ? `${baseUrl}${relativePath}` : `${baseUrl}/${relativePath}`;
  }

  downloadPdf() {
    if (this.book?.pdfUrl) {
      const pdfUrl = this.getFullImageUrl(this.book.pdfUrl);
      window.open(pdfUrl, '_blank');
    }
  }
}