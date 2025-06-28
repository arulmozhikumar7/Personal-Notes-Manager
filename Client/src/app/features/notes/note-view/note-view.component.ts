import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

import { NoteService } from '@/core/services/note.service';
import { ApiResponse } from '@/core/models/api-response.model';
import { NoteDto } from '@/core/models/note.model';

import { FeatureFlags } from '@/core/models/feature-flags.model';
import { FeatureFlagService } from '@/core/services/feature-flag.service';
import { ExportService } from '@/core/services/export.service';

@Component({
  selector: 'app-note-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './note-view.component.html',
})
export class NoteViewComponent implements OnInit, AfterViewInit {
  @ViewChild('quillEditor', { static: false }) quillEditorRef!: ElementRef;
  exportFlags: FeatureFlags = { pdfExport: false, imageExport: false, htmlExport: false };
  dropdownOpen = false;
  note: NoteDto = {
    id: 0,
    title: '',
    content: '',
    tags: [],
    createdAt: '',
    savedAt: '',
    isPinned: false
  };

  isEditMode = false;
  tagInput = '';
  loading = true;
  errorMessage = '';
  saveStatus: 'idle' | 'saving' | 'saved' | 'error' = 'idle';
  downloading: boolean = false;

  private saveSubject = new Subject<void>();
  private quillInstance: Quill | null = null;

  constructor(
    private route: ActivatedRoute,
    private noteService: NoteService,
    private exportService: ExportService,
    private featureFlagService: FeatureFlagService,
  ) {}

  ngOnInit(): void {
    this.featureFlagService.loadFlags().subscribe(flags => this.exportFlags = flags);
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id) {
      this.noteService.getById(id).subscribe({
        next: (res: ApiResponse<NoteDto>) => {
          this.note = res.data ?? this.note;
          this.loading = false;
        },
        error: (err) => {
          if (err.status === 404) {
            this.errorMessage = 'No note found with that ID.';
          } else {
            this.errorMessage = 'Failed to load note.';
          }
          this.loading = false;
        }
      });
    } else {
      console.warn('No note ID found in route');
      this.loading = false;
    }

    this.saveSubject.pipe(debounceTime(1000)).subscribe(() => this.autoSave());
  }

  ngAfterViewInit(): void {
    const tourKey = 'note-view';
    const localStorageKey = `tour-${tourKey}`;

    if (!localStorage.getItem(localStorageKey)) {
      localStorage.setItem(localStorageKey, 'false');
    }

    if (this.isEditMode) {
      this.initEditor();
    }
  }

  toggleEdit(): void {
    this.isEditMode = !this.isEditMode;
    this.saveStatus = 'idle';

    if (this.quillInstance) {
      this.quillInstance.off('text-change');
      this.quillEditorRef.nativeElement.innerHTML = '';
      this.quillInstance = null;
    }

    if (this.isEditMode) {
      setTimeout(() => {
        this.initEditor();
        this.startEditTour();
      });
    }
  }

  onTitleChange(): void {
    this.triggerSave();
  }

  onTagInputKeyDown(event: KeyboardEvent): void {
  if (event.key === 'Enter') {
    event.preventDefault();
    const newTag = this.tagInput.trim();

    if (!newTag) return;
    if (this.note.tags.includes(newTag)) {
      this.tagInput = '';
      return;
    }

    this.note.tags.push(newTag);
    this.tagInput = '';
    this.triggerSave();
  }
}

  removeTag(index: number): void {
    this.note.tags.splice(index, 1);
    this.triggerSave();
  }

  triggerSave(): void {
    if (this.isEditMode) {
      this.saveStatus = 'saving';
      this.saveSubject.next();
    }
  }

  autoSave(): void {
    if (this.note?.id && this.isEditMode) {
      this.noteService.update(this.note.id, this.note).subscribe({
        next: () => {
          this.saveStatus = 'saved';
          setTimeout(() => {
            if (this.saveStatus === 'saved') {
              this.saveStatus = 'idle';
            }
          }, 2000);
        },
        error: (err) => {
          this.saveStatus = 'error';
          setTimeout(() => {
            if (this.saveStatus === 'error') {
              this.saveStatus = 'idle';
            }
          }, 3000);
        }
      });
    }
  }

  private initEditor(): void {
    const toolbarOptions = [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ header: 1 }, { header: 2 }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ script: 'sub' }, { script: 'super' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ direction: 'rtl' }],
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      ['clean'],
      ['link', 'image', 'video']
    ];

    this.quillInstance = new Quill(this.quillEditorRef.nativeElement, {
      theme: 'snow',
      readOnly: !this.isEditMode,
      placeholder: 'Start writing...',
      modules: {
        toolbar: toolbarOptions
      }
    });

    if (this.isEditMode) {
      this.quillInstance.on('text-change', () => {
        this.note.content = this.quillInstance!.root.innerHTML;
        this.triggerSave();
      });
    }

    this.setQuillContent();
  }

  private setQuillContent(): void {
    if (this.quillInstance && this.note.content) {
      setTimeout(() => {
        try {
          this.quillInstance!.clipboard.dangerouslyPasteHTML(this.note.content);
        } catch (e) {
          console.error('Failed to paste HTML into Quill', e);
        }
      });
    }
  }

  startEditTour(): void {
    const tourKey = 'note-view';
    const localStorageKey = `tour-${tourKey}`;

    if (localStorage.getItem(localStorageKey) === 'true') return;

    const Driver = driver({
      showProgress: true,
      popoverClass: 'driverjs-theme',
      steps: [
        {
          element: '#quill-editor-container',
          popover: {
            title: '📝 Edit Your Note',
            description: 'You can now freely edit your note content here.',
            side: 'top',
            align: 'start'
          }
        },
        {
          element: '#tag-input',
          popover: {
            title: '🏷️ Add Tags',
            description: 'Press Enter after typing to add a tag.',
            side: 'top',
            align: 'start'
          }
        },
        {
          popover: {
            title: '💾 No Save Button?',
            description: `Heeey! Don't go looking for a save button — everything you type is autosaved ✨  
            Even if you close or refresh accidentally, we've got you covered!`,
            align: 'center'
          }
        }
      ],
      onDestroyed: () => {
        localStorage.setItem(localStorageKey, 'true');
      }
    });

    setTimeout(() => Driver.drive(), 500);
  }

  download(format: 'pdf' | 'image' | 'html') {
  this.downloading = true; 
  const id = this.note.id;
  const downloadMap = {
    pdf: this.exportService.downloadPdf,
    image: this.exportService.downloadImage,
    html: this.exportService.downloadHtml
  };

  downloadMap[format].call(this.exportService, id).subscribe({
    next: (blob) => {
      const a = document.createElement('a');
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = `${this.note.title}.${format === 'pdf' ? 'pdf' : format === 'image' ? 'png' : 'html'}`;
      a.click();
      window.URL.revokeObjectURL(url);
    },
    error: (err) => {
      console.error('Download failed', err);
      
    },
    complete: () => {
      this.downloading = false; 
    }
  });
}


  get anyExportEnabled(): boolean {
    return this.exportFlags.pdfExport || this.exportFlags.imageExport || this.exportFlags.htmlExport;
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown(): void {
    this.dropdownOpen = false;
  }
}
