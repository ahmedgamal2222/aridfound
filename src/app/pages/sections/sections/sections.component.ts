// sections.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionService } from '../../../core/services/section.service';
import { Section, ViewType } from '../../../core/models/section.model';
import { ActivatedRoute, Router } from '@angular/router';
import { CardComponent } from '../../../card/card.component';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../core/environments/environment';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-sections',
  standalone: true,
  imports: [CommonModule, CardComponent, TranslateModule],
  template: `
    <section class="py-5">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2>{{ 'SECTION.ALL_SECTIONS' | translate }}</h2>
          <div class="btn-group" *ngIf="authService.isAdmin()">
            <button class="btn btn-primary" routerLink="/admin/sections">
              {{ 'SECTION.MANAGE' | translate }}
            </button>
          </div>
        </div>
        
        <div class="row g-4">
          <div class="col-md-6 col-lg-4" *ngFor="let section of sections; trackBy: trackBySectionId">
            <app-card [section]="section"></app-card>
          </div>
        </div>

        <div class="alert alert-info mt-4" *ngIf="sections.length === 0">
          {{ 'SECTION.NO_SECTIONS_FOUND' | translate }}
        </div>
      </div>
    </section>
  `,
  styles: []
})
export class SectionsComponent {
  private translate = inject(TranslateService);
  private sectionService = inject(SectionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  authService = inject(AuthService);

  sections: Section[] = [];

  ngOnInit() {
    this.loadSections();
  }

  loadSections() {
    this.sectionService.getAllSections().subscribe({
      next: (sections) => {
        this.sections = sections.map(s => this.transformIncomingData(s));
      },
      error: (err) => this.toastr.error('Failed to load sections')
    });
  }

  private transformIncomingData(apIdata: any): Section {
    return {
      ...apIdata,
      Contents: apIdata.Contents || [],
      createdAt: new Date(apIdata.CreatedAt),
      updatedAt: new Date(apIdata.UpdatedAt)
    };
  }

  trackBySectionId(index: number, section: Section): number {
    return section.Id;
  }
}