import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FeatureFlags } from '../models/feature-flags.model';

@Injectable({
  providedIn: 'root'
})
export class FeatureFlagService {
  private flagSubject = new BehaviorSubject<FeatureFlags>({
    pdfExport: false,
    imageExport: false,
    htmlExport: false
  });

  constructor(private http: HttpClient) {}


  loadFlags(): Observable<FeatureFlags> {
    return this.http.get<FeatureFlags>('http://localhost:5229/api/FeatureFlag').pipe(
      tap(flags => this.flagSubject.next(flags))
    );
  }


  get flags$(): Observable<FeatureFlags> {
    return this.flagSubject.asObservable();
  }

  get currentFlags(): FeatureFlags {
    return this.flagSubject.value;
  }
}
