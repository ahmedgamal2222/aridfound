import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HTTP_INTERCEPTORS
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  // لا تحاول قراءة التوكن من الكوكي
  const cloned = req.clone({
    withCredentials: true // فقط هذا يكفي ليتم إرسال الكوكي التلقائي من المتصفح
  });

  return next.handle(cloned);
}
}
// ✅ هذا السطر هو المهم لتصدير AuthInterceptorProvider
export const AuthInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: AuthInterceptor,
  multi: true
};
