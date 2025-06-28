import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '@/core/models/api-response.model';
import { NoteCreateDto,NoteDto,NoteUpdateDto } from '../models/note.model';

@Injectable({
  providedIn: 'root',
})
export class NoteService {
  private readonly endpoint = 'Notes';

  constructor(private api: ApiService) {}

  getAll(): Observable<ApiResponse<NoteDto[]>> {
    return this.api.get<NoteDto[]>(this.endpoint);
  }

  getById(id: number): Observable<ApiResponse<NoteDto>> {
    return this.api.get<NoteDto>(`${this.endpoint}/${id}`);
  }

  create(note: NoteCreateDto): Observable<ApiResponse<null>> {
    return this.api.post<null>(this.endpoint, note);
  }

  update(id: number, note: NoteUpdateDto): Observable<ApiResponse<null>> {
    return this.api.put<null>(`${this.endpoint}/${id}`, note);
  }

  delete(id: number): Observable<ApiResponse<null>> {
    return this.api.delete<null>(`${this.endpoint}/${id}`);
  }

  togglePin(id: number): Observable<ApiResponse<null>> {
    return this.api.patch<null>(`${this.endpoint}/${id}/pin`, {});
  }

  search(keyword: string): Observable<ApiResponse<NoteDto[]>> {
    return this.api.get<NoteDto[]>(`${this.endpoint}/search?keyword=${encodeURIComponent(keyword)}`);
  }

filterByTags(tags: string[]): Observable<ApiResponse<NoteDto[]>> {
  const queryParams = tags.map(tag => `tags=${encodeURIComponent(tag)}`).join('&');
  return this.api.get<NoteDto[]>(`${this.endpoint}/tags?${queryParams}`);
}
}
