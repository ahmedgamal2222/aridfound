import { Component, OnInit } from '@angular/core';
import { Section } from '../core/models/section.model';
import { CommonModule } from '@angular/common';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { DatePipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-journal-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  providers: [DatePipe],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">
        {{journal?.title}} - {{ 'JOURNAL.VOL' | translate }} {{journal?.volume}}, {{ 'JOURNAL.ISSUE' | translate }} {{journal?.issue}}
      </h4>
      <button type="button" class="btn-close" (click)="bsModalRef.hide()"
              [attr.aria-label]="'MODAL.CLOSE' | translate"></button>
    </div>
    <div class="modal-body">
      <div class="row">
        <div class="col-md-4">
          <img [src]="getFullImageUrl(journal?.imageUrl)" 
               [alt]="journal?.title" 
               class="img-fluid rounded shadow mb-3">
          <div class="journal-meta">
            <p><strong>{{ 'JOURNAL.ISSN' | translate }}:</strong> {{journal?.issn || ('COMMON.NA' | translate)}}</p>
            <p><strong>{{ 'JOURNAL.PUBLISHED' | translate }}:</strong> {{journal?.publicationDate | date:'MMMM yyyy'}}</p>
          </div>
        </div>
        <div class="col-md-8">
          <div [innerHTML]="journal?.content"></div>
          <div *ngIf="journal?.description" class="mt-3">
            <h5>{{ 'JOURNAL.ABSTRACT' | translate }}</h5>
            <p>{{journal?.description}}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button *ngIf="journal?.pdfUrl" 
              class="btn btn-primary" 
              (click)="downloadPdf()">
        <i class="fas fa-download me-2"></i>{{ 'JOURNAL.DOWNLOAD_ISSUE' | translate }}
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
    .journal-meta {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
    }
  `]
})
export class JournalModalComponent implements OnInit {
  journal?: Section;

  constructor(
    public bsModalRef: BsModalRef,
    private datePipe: DatePipe,
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
    if (this.journal?.pdfUrl) {
      const pdfUrl = this.getFullImageUrl(this.journal.pdfUrl);
      window.open(pdfUrl, '_blank');
    }
  }
}