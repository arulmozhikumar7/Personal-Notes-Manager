import { Injectable, computed, signal } from '@angular/core';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { DraftDto, DraftCreateDto } from '@/core/models/draft.model';

const LOCAL_STORAGE_KEY = 'personal-notes-draft';

@Injectable({
  providedIn: 'root',
})
export class DraftRecoveryService {
  // Signals to track current draft input
  private _title = signal('');
  private _content = signal('');
  private _tags = signal<string[]>([]);

  // Signal exposing current state
  readonly draft = computed<DraftCreateDto>(() => ({
    title: this._title(),
    content: this._content(),
    tags: this._tags(),
  }));

  // For debounced save
  private saveTrigger$ = new Subject<void>();

  constructor() {
    // Load draft if present
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const draft: DraftCreateDto = JSON.parse(saved);
        this._title.set(draft.title);
        this._content.set(draft.content);
        this._tags.set(draft.tags || []);
      } catch (err) {
        console.warn('Failed to parse local draft');
      }
    }

    // Auto-save listener
    this.saveTrigger$
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(() => {
        this.saveToLocalStorage();
      });
  }

  // === Mutations ===
  updateTitle(value: string) {
    this._title.set(value);
    this.triggerSave();
  }

  updateContent(value: string) {
    this._content.set(value);
    this.triggerSave();
  }

  updateTags(tags: string[]) {
    this._tags.set(tags);
    this.triggerSave();
  }

  restore(): DraftCreateDto {
    return this.draft();
  }

  clear() {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    this._title.set('');
    this._content.set('');
    this._tags.set([]);
  }

  // === Internals ===
  private triggerSave() {
    this.saveTrigger$.next();
  }

  private saveToLocalStorage() {
    const current = this.draft();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
  }
}
