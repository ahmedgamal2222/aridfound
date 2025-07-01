import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2 class="text-center mb-4">Register</h2>
        <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
          <div class="mb-3">
            <label for="username" class="form-label">Username</label>
            <input type="text" class="form-control" id="username" [(ngModel)]="model.username" name="username" required>
          </div>
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input type="email" class="form-control" id="email" [(ngModel)]="model.email" name="email" required>
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input type="password" class="form-control" id="password" [(ngModel)]="model.password" name="password" required>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="firstName" class="form-label">First Name</label>
              <input type="text" class="form-control" id="firstName" [(ngModel)]="model.firstName" name="firstName">
            </div>
            <div class="col-md-6 mb-3">
              <label for="lastName" class="form-label">Last Name</label>
              <input type="text" class="form-control" id="lastName" [(ngModel)]="model.lastName" name="lastName">
            </div>
          </div>
          <button type="submit" class="btn btn-primary w-100" [disabled]="registerForm.invalid || isLoading">
            <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
            Register
          </button>
        </form>
        <div class="text-center mt-3">
          <p>Already have an account? <a routerLink="/login">Login</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      background-color: #f8f9fa;
    }
    .auth-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 500px;
    }
  `]
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  model = {
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  };
  isLoading = false;

  onSubmit() {
    this.isLoading = true;
    this.authService.register(this.model).subscribe({
      next: () => {
        this.router.navigate(['/login']);
        this.toastr.success('Registration successful. Please login.');
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error('Registration failed. Please try again.');
      }
    });
  }
}