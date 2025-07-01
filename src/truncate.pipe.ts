import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {
  transform(value: string | null | undefined, limit: number = 25, completeWords: boolean = false, ellipsis: string = '...'): string {
    // معالجة القيم null أو undefined
    if (value == null) return '';
    
    // معالجة حالة السلسلة الفارغة
    if (value.length === 0) return value;
    
    // إذا كانت القيمة أقصر من الحد المطلوب
    if (value.length <= limit) return value;
    
    // إذا طلبنا إكمال الكلمات
    if (completeWords) {
      limit = value.substr(0, limit).lastIndexOf(' ');
      if (limit < 0) return ellipsis; // إذا لم نجد مسافات
    }
    
    return `${value.substr(0, limit)}${ellipsis}`;
  }
}