import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faQuestionCircle, 
  faExclamationTriangle, 
  faInfoCircle, 
  faCheckCircle,
  faTimes 
} from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

export type DialogType = 'confirm' | 'warning' | 'info' | 'success';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, TranslateModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() title = 'CONFIRM_DIALOG.DEFAULT_TITLE';
  @Input() message = 'CONFIRM_DIALOG.DEFAULT_MESSAGE';
  @Input() confirmText = 'CONFIRM_DIALOG.CONFIRM';
  @Input() cancelText = 'CONFIRM_DIALOG.CANCEL';
  @Input() type: DialogType = 'confirm';
  
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  // Icons
  icons = {
    question: faQuestionCircle,
    warning: faExclamationTriangle,
    info: faInfoCircle,
    success: faCheckCircle,
    close: faTimes
  };

  get dialogIcon() {
    switch (this.type) {
      case 'warning': return this.icons.warning;
      case 'info': return this.icons.info;
      case 'success': return this.icons.success;
      default: return this.icons.question;
    }
  }

  get dialogClass() {
    return `dialog-${this.type}`;
  }

  onConfirm(): void {
    this.confirm.emit();
    this.closeDialog();
  }

  onCancel(): void {
    this.cancel.emit();
    this.closeDialog();
  }

  closeDialog(): void {
    this.close.emit();
  }
}