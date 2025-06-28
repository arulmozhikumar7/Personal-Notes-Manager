import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, combineLatest, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  takeUntil,
  map,
  startWith,
} from 'rxjs';

import { NoteService } from '@/core/services/note.service';
import { TagService } from '@/core/services/tag.service';
import { NoteDto } from '@/core/models/note.model';
import { ApiResponse } from '@/core/models/api-response.model';

import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

@Component({
  standalone: true,
  selector: 'app-note-list',
  templateUrl: './note-list.component.html',
  imports: [
    DatePipe,
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
  ],
})
export class NoteListComponent implements OnInit, OnDestroy, AfterViewInit {
  notes: NoteDto[] = [];
  allTags: string[] = [];
  filteredTags: string[] = [];
  selectedTags: string[] = [];

  loading = true;
  showTagBox = false;
  showTagPanel = false;

  searchControl = new FormControl('');
  tagFilterControl = new FormControl<string[]>([]);
  tagSearchControl = new FormControl('');

  private destroy$ = new Subject<void>();

  constructor(
    private noteService: NoteService,
    private tagService: TagService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTags();
    this.setupFilters();

    this.tagSearchControl.valueChanges
      .pipe(startWith(''), debounceTime(200), distinctUntilChanged())
      .subscribe((search: string | null) => {
        const term = (search ?? '').toLowerCase();
        this.filteredTags = this.allTags.filter(tag =>
          tag.toLowerCase().includes(term)
        );
      });
  }

  ngAfterViewInit(): void {
    const tourKey = 'note-list';
    const localStorageKey = `tour-${tourKey}`;

    if (!localStorage.getItem(localStorageKey)) {
      localStorage.setItem(localStorageKey, 'false');
    }

    if (localStorage.getItem(localStorageKey) === 'true') return;
  }

  notifyAddNote() {
    const driverObj = driver({
      showProgress: true,
      popoverClass: 'driverjs-theme',
      steps: [
        {
          element: '#add-note',
          popover: {
            title: 'Add Note',
            description: 'Click here to add a note',
            side: 'top',
            align: 'start',
          },
        },
      ],
    });

    setTimeout(() => driverObj.drive(), 300);
  }

  startTour() {
    const tourKey = 'note-list';
    const localStorageKey = `tour-${tourKey}`;

    const driverObj = driver({
      showProgress: true,
      popoverClass: 'driverjs-theme',
      steps: [
        {
          element: '#note-card',
          popover: {
            title: '📝 Note Preview',
            description: 'Here’s a glimpse of your awesome note. Click to view full details!',
            side: 'top',
            align: 'start',
          },
        },
        {
          element: '#note-view',
          popover: {
            title: '🔍 View Note',
            description: 'Click to dive into your note and explore everything you’ve written.',
            side: 'top',
            align: 'start',
          },
        },
        {
          element: '#note-delete',
          popover: {
            title: '🗑️ Delete Note',
            description: 'Want to clean things up? Click here to say goodbye to this note.',
            side: 'top',
            align: 'start',
          },
        },
        {
          element: '#note-pin',
          popover: {
            title: '📌 Pin Note',
            description: 'Keep important notes at the top by pinning them here.',
            side: 'top',
            align: 'start',
          },
        },
        {
          element: '#note-modify-time',
          popover: {
            title: '⏱️ Last Modified',
            description: 'See when you last updated this note — stay on top of your edits!',
            side: 'top',
            align: 'start',
          },
        },
        {
          element: '#note-search',
          popover: {
            title: '🔎 Search Notes',
            description: 'Type here to quickly find the note you need. Lightning fast! ⚡',
            side: 'top',
            align: 'start',
          },
        },
        {
          element: '#note-tag-filter',
          popover: {
            title: '🏷️ Tag Filter',
            description: 'Filter notes by tags to stay organized like a pro!',
            side: 'top',
            align: 'start',
          },
        },
        {
          popover: {
            title: '🎯 All Done!',
            description: 'That’s the tour! You’re now a note-taking ninja 🥷💡 — let the productivity begin!',
          },
        },
      ],
      onDestroyed: () => {
        localStorage.setItem(localStorageKey, 'true');
      },
    });

    setTimeout(() => driverObj.drive(), 300);
  }

  setupFilters(): void {
    combineLatest([
      this.searchControl.valueChanges.pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged(),
        map(value => value?.trim() ?? '')
      ),
      this.tagFilterControl.valueChanges.pipe(
        startWith([]),
        map(tags => tags ?? []),
        distinctUntilChanged()
      ),
    ])
      .pipe(
        switchMap(([searchTerm, selectedTags]) => {
          this.loading = true;

          if (searchTerm && selectedTags.length > 0) {
            return this.noteService.search(searchTerm).pipe(
              map(res => {
                const filtered =
                  res.data?.filter(note =>
                    selectedTags.every(tag => note.tags.includes(tag))
                  ) ?? [];
                return { ...res, data: filtered };
              })
            );
          }

          if (searchTerm) return this.noteService.search(searchTerm);
          if (selectedTags.length > 0) return this.noteService.filterByTags(selectedTags);

          return this.noteService.getAll();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res: ApiResponse<NoteDto[]>) => {
          this.notes = res.data ?? [];
          this.sortNotesInPlace();
          this.loading = false;

          const tourKey = 'note-list';
          const localStorageKey = `tour-${tourKey}`;

          if (this.notes.length === 0) {
            if (localStorage.getItem(localStorageKey) === 'true') return;
            this.notifyAddNote();
          }

          if (localStorage.getItem(localStorageKey) !== 'true' && this.notes.length > 0) {
            this.startTour();
          }
        },
        error: (err) => {
          console.error('Failed to filter notes:', err);
          this.loading = false;
        },
      });
  }

  loadTags(): void {
    this.tagService.getAllTags().subscribe({
      next: (res: ApiResponse<string[]>) => {
        this.allTags = res.data ?? [];
      },
      error: (err) => {
        console.error('Failed to fetch tags:', err);
      },
    });
  }

  loadNotes(): void {
    this.loading = true;
    this.noteService.getAll().subscribe({
      next: (res: ApiResponse<NoteDto[]>) => {
        this.notes = res.data ?? [];
        this.sortNotesInPlace();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load notes', err);
        this.loading = false;
      },
    });
  }

  applyTagFilter(): void {
    this.loading = true;
    if (this.selectedTags.length === 0) {
      this.loadNotes();
    } else {
      this.noteService.filterByTags(this.selectedTags).subscribe(this.handleNoteResponse);
    }
  }

  toggleTagPanel(): void {
    this.showTagPanel = !this.showTagPanel;
  }

  toggleTag(tag: string): void {
    const index = this.selectedTags.indexOf(tag);
    if (index > -1) {
      this.selectedTags.splice(index, 1);
    } else {
      this.selectedTags.push(tag);
    }
    this.applyTagFilter();
  }

  removeTag(tag: string): void {
    this.selectedTags = this.selectedTags.filter(t => t !== tag);
    this.applyTagFilter();
  }

  clearTags(): void {
    this.selectedTags = [];
    this.applyTagFilter();
  }

  togglePin(note: NoteDto): void {
    this.noteService.togglePin(note.id).subscribe({
      next: () => {
        note.isPinned = !note.isPinned;
        this.sortNotesInPlace();
      },
      error: (err) => {
        console.error('Failed to toggle pin', err);
        alert('Pin toggle failed.');
      },
    });
  }

  deleteNote(noteId: number): void {
    if (confirm('Are you sure you want to delete this note?')) {
      this.noteService.delete(noteId).subscribe({
        next: () => {
          this.notes = this.notes.filter(note => note.id !== noteId);
          this.loadTags();
          console.log('Note deleted successfully');
        },
        error: (err) => {
          console.error('Failed to delete note', err);
          alert('Delete failed. Please try again.');
        },
      });
    }
  }

  goToNote(id: number): void {
    this.router.navigate(['/notes', id]);
  }

  sortedNotes(): NoteDto[] {
    return [...this.notes].sort((a, b) => {
      if (a.isPinned === b.isPinned) return 0;
      return a.isPinned ? -1 : 1;
    });
  }

  sortNotesInPlace(): void {
    this.notes.sort((a, b) => Number(b.isPinned) - Number(a.isPinned));
  }

  private handleNoteResponse = {
    next: (res: ApiResponse<NoteDto[]>) => {
      this.notes = res.data ?? [];
      this.sortNotesInPlace();
      this.loading = false;
    },
    error: (err: any) => {
      console.error('Failed to load filtered notes', err);
      this.loading = false;
    },
  };

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
