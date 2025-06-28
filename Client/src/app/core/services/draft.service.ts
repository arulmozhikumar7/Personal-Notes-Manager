import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '@/core/models/api-response.model';
import { DraftDto,DraftCreateDto } from '../models/draft.model';

@Injectable({
  providedIn: 'root',
})
export class DraftService {
  private readonly endpoint = 'drafts';

  constructor(private api: ApiService) {}

  getAll(): Observable<ApiResponse<DraftDto[]>> {
    return this.api.get<DraftDto[]>(this.endpoint);
  }

  getById(id: number): Observable<ApiResponse<DraftDto>> {
    return this.api.get<DraftDto>(`${this.endpoint}/${id}`);
  }

 createOrUpdate(draft: DraftCreateDto, id?: number): Observable<ApiResponse<DraftDto>> {
  if (id) {
    return this.api.put<DraftDto>(`${this.endpoint}/${id}`, draft);
  } else {
    return this.api.post<DraftDto>(this.endpoint, draft);
  }
}


  delete(id: number): Observable<ApiResponse<null>> {
    return this.api.delete<null>(`${this.endpoint}/${id}`);
  }
}
