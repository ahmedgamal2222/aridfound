import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { SectionsComponent } from './pages/sections/sections/sections.component';
import { SectionDetailsComponent } from './pages/sections/section-details/section-details.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard/admin-dashboard.component';
import { ManageSectionsComponent } from './pages/sections/manage-sections/manage-sections.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'sections', component: SectionsComponent },
  { path: 'sections/:id', component: SectionDetailsComponent },
  { 
    path: 'admin', 
    component: AdminDashboardComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      { path: 'sections', component: ManageSectionsComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];