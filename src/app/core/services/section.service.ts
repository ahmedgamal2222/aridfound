// section.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Section, SectionContent, ViewType } from '../models/section.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SectionService {
  private apiUrl = `${environment.apiUrl}/sections`;

  constructor(private http: HttpClient) { }

  // دوال الـ GET
  getAllSections(): Observable<Section[]> {
    return this.http.get<any[]>(this.apiUrl, { withCredentials: true }).pipe(
      map((sections: any[]) => sections.map(section => this.processSection(section)))
    );
  }

  getSectionById(Id: number): Observable<Section> {
    return this.http.get<any>(`${this.apiUrl}/${Id}`, { withCredentials: true }).pipe(
      map((section: any) => this.processSection(section))
    );
  }

  createSection(section: Partial<Section>): Observable<Section> {
    const payload = this.prepareSectionPayload(section);
    return this.http.post<Section>(this.apiUrl, payload, { withCredentials: true }).pipe(
      map((response: any) => this.processSection(response))
    );
  }

  updateSection(Id: number, section: Partial<Section>): Observable<Section> {
    const payload = this.prepareSectionPayload(section);
    return this.http.put<Section>(`${this.apiUrl}/${Id}`, payload, { withCredentials: true }).pipe(
      map((response: any) => this.processSection(response))
    );
  }

  // دوال المعالجة
  private processSection(section: any): Section {
    return {
      ...section,
      LanguageId: this.normalizeLanguageId(section.LanguageId),
      Contents: section.Contents?.map((content: any) => this.processContent(content)) || []
    };
  }

  private processContent(content: any): SectionContent {
    return {
      ...content,
      LanguageId: this.normalizeLanguageId(content.LanguageId)
    };
  }

  private normalizeLanguageId(LanguageId: any): number | null {
    if (LanguageId === undefined || LanguageId === null || LanguageId === '') {
      return null;
    }
    
    const num = Number(LanguageId);
    return isNaN(num) ? null : num;
  }

private prepareSectionPayload(section: Partial<Section>): any {
  const payload: any = { 
    ...section
  };

  // نتأكد إن لو مش محدد لغة يبقى null
  if (section.LanguageId === undefined) {
    payload.LanguageId = null;
  }

  console.log('Final payload with LanguageId only:', payload);
  return payload;
}

  private prepareContentPayload(content: Partial<SectionContent>): any {
    const payload: any = { ...content };
    
    // معالجة LanguageId للإرسال للخادم
    if (payload.LanguageId === null || payload.LanguageId === undefined) {
      // إزالة الحقل تماماً بدلاً من إرسال null
      delete payload.LanguageId;
    }
    
    return payload;
  }

  // باقي الدوال...
  deleteSection(Id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${Id}`, { withCredentials: true });
  }

  addContent(content: Partial<SectionContent>): Observable<SectionContent> {
    const payload = this.prepareContentPayload(content);
    return this.http.post<SectionContent>(`${this.apiUrl}/content`, payload, { withCredentials: true });
  }

  updateContent(Id: number, content: Partial<SectionContent>): Observable<SectionContent> {
    const payload = this.prepareContentPayload(content);
    return this.http.put<SectionContent>(`${this.apiUrl}/content/${Id}`, payload, { withCredentials: true });
  }

  deleteContent(Id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/content/${Id}`, { withCredentials: true });
  }

  getMenuSections(): Observable<Section[]> {
    return this.http.get<Section[]>(`${this.apiUrl}/menu`, { withCredentials: true });
  }

  getHomePageSections(): Observable<Section[]> {
    return this.http.get<Section[]>(`${this.apiUrl}/home`, { withCredentials: true });
  }

  getFooterSections(): Observable<Section[]> {
    return this.http.get<Section[]>(`${this.apiUrl}/footer`, { withCredentials: true });
  }

  getLanguages(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/languages`, { withCredentials: true });
  }

  getViewTypes(): ViewType[] {
    return Object.values(ViewType);
  }
}