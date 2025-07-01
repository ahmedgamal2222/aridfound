import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  model = { username: '', password: '' };
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {}

  onSubmit(): void {
    this.isLoading = true;
    this.authService.login(this.model).subscribe({
      next: () => {
        this.authService.initializeAuthState();
        this.router.navigate(['/']);
        this.toastr.success(this.translate.instant('LOGIN.SUCCESS'));
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error(this.translate.instant('LOGIN.ERROR'));
        console.error('Login error:', err);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}