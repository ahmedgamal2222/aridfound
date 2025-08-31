import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { BehaviorSubject, Observable, of, tap, catchError } from 'rxjs';
import { LoginModel } from '../../core/models/login.model';
import { RegisterModel } from '../../core/models/register.model';
import { AuthResponse } from '../../core/models/auth-response.model';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;

  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  public currentUser = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();


  constructor() {
    
    this.loadCurrentUser().subscribe();
  }

  login(model: LoginModel): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/account/login`, model, {
      withCredentials: true
    }).pipe(
      tap(response => {
        this.currentUserSubject.next(response);
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  register(model: RegisterModel): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/account/register`, model, {
      withCredentials: true
    });
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/account/logout`, {}, {
      withCredentials: true
    }).subscribe(() => {
      this.currentUserSubject.next(null);
      this.isAuthenticatedSubject.next(false);
      this.router.navigate(['/login']);
    });
  }

  loadCurrentUser(): Observable<AuthResponse | null> {
    return this.http.get<AuthResponse>(`${this.apiUrl}/account/me`, {
      withCredentials: true
    }).pipe(
      tap(user => {
          console.log('Loaded user:', user); // ← أضف هذا

        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      }),
      catchError(() => {
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
        return of(null);
      })
    );
  }

  getUserId(): string | null {
    return this.currentUserSubject.value?.userId ?? null;
  }

isAdmin(): boolean {
  const roles = this.currentUserSubject.value?.Roles;
  if (!Array.isArray(roles)) return false;
  return roles.includes('Admin');
}



  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }
  public initializeAuthState(): void {
  this.loadCurrentUser().subscribe();
}
}
