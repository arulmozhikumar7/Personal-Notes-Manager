
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private baseUrl = 'http://localhost:5229/api/Notes';

  constructor(private http: HttpClient) {}

  downloadPdf(id: number) {
    return this.http.get(`${this.baseUrl}/${id}/export`, { responseType: 'blob' });
  }

  downloadImage(id: number) {
    return this.http.get(`${this.baseUrl}/${id}/export/image`, { responseType: 'blob' });
  }

  downloadHtml(id: number) {
    return this.http.get(`${this.baseUrl}/notes/${id}/export/html`, { responseType: 'blob' });
  }
}
