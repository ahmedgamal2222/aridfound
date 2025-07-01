import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="modal-backdrop fade show" *ngIf="isOpen"></div>
    <div class="modal fade show d-block" *ngIf="isOpen" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <ng-content select="[modal-title]"></ng-content>
            <button type="button" class="btn-close" (click)="close.emit()" 
                    [attr.aria-label]="'MODAL.CLOSE' | translate"></button>
          </div>
          <div class="modal-body">
            <ng-content></ng-content>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      z-index: 1040;
    }
    .modal {
      z-index: 1050;
    }
  `]
})
export class ModalComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
}