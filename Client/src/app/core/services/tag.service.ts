import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { ApiResponse } from '@/core/models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class TagService {
  private readonly endpoint = 'tags';

  constructor(private api: ApiService) {}

  getAllTags(): Observable<ApiResponse<string[]>> {
    return this.api.get<string[]>(this.endpoint);
  }
}
