import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './layouts/navbar/navbar.component';
import { AuthService } from './core/services/auth.service';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent,FooterComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="container">
      <router-outlet></router-outlet>
    </div>
    <app-footer></app-footer>
  `,
  styles: []
})

export class AppComponent implements OnInit {
  constructor(private authService: AuthService) {
    console.log('AppComponent constructor');
    this.authService.initializeAuthState(); // انقل التهيئة هنا
  }
  
  ngOnInit() {
    console.log('AppComponent ngOnInit');
  }
  
  title = 'arid-foundation-frontend';
}
