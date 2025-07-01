import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../core/environments/environment';
import { Section, SectionType } from '../../core/models/section.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SectionService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Basic CRUD operations
  getAllSections(): Observable<Section[]> {
    return this.http.get<Section[]>(`${this.apiUrl}/sections`, { withCredentials: true });
  }

  getSectionById(id: number): Observable<Section> {
    return this.http.get<Section>(`${this.apiUrl}/sections/${id}`, { withCredentials: true });
  }

  addSection(section: Section): Observable<Section> {
    return this.http.post<Section>(`${this.apiUrl}/sections`, section, { withCredentials: true });
  }

  updateSection(id: number, section: Section): Observable<Section> {
    return this.http.put<Section>(`${this.apiUrl}/sections/${id}`, section, { withCredentials: true });
  }

  deleteSection(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/sections/${id}`, { withCredentials: true });
  }

  // Specialized section operations
  getSectionsByType(type: SectionType): Observable<Section[]> {
    return this.http.get<Section[]>(`${this.apiUrl}/sections/type/${type}`, { withCredentials: true });
  }

  getHomePageSections(): Observable<Section[]> {
    return this.http.get<Section[]>(`${this.apiUrl}/sections/home`, { withCredentials: true });
  }

  getHeroSections(): Observable<Section[]> {
    return this.http.get<Section[]>(`${this.apiUrl}/sections/hero`, { withCredentials: true });
  }

  // File upload operations
  addSectionWithFiles(formData: FormData): Observable<Section> {
    return this.http.post<Section>(`${this.apiUrl}/sections/with-files`, formData, { 
      withCredentials: true 
    });
  }

  updateSectionWithFiles(id: number, formData: FormData): Observable<Section> {
    return this.http.put<Section>(`${this.apiUrl}/sections/with-files/${id}`, formData, { 
      withCredentials: true 
    });
  }

  // Media specific operations
  uploadMediaFile(file: File, sectionId: number): Observable<{fileUrl: string}> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{fileUrl: string}>(
      `${this.apiUrl}/sections/${sectionId}/media`, 
      formData, 
      { withCredentials: true }
    );
  }

  // PDF specific operations (for Books and Journal)
  uploadPdfFile(file: File, sectionId: number): Observable<{pdfUrl: string}> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{pdfUrl: string}>(
      `${this.apiUrl}/sections/${sectionId}/pdf`, 
      formData, 
      { withCredentials: true }
    );
  }

  // Journal specific operations
  getJournalIssues(): Observable<Section[]> {
    return this.http.get<Section[]>(`${this.apiUrl}/sections/journal/issues`, { 
      withCredentials: true 
    });
  }

  // Partner specific operations
  getPartnersByType(type: string): Observable<Section[]> {
    return this.http.get<Section[]>(`${this.apiUrl}/sections/partners/${type}`, { 
      withCredentials: true 
    });
  }
}