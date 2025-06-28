import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DraftService } from '@/core/services/draft.service';
import { DraftDto } from '@/core/models/draft.model';
import { ApiResponse } from '@/core/models/api-response.model';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { NoteService } from '@/core/services/note.service';
import { driver } from 'driver.js';
import "driver.js/dist/driver.css";

@Component({
  selector: 'app-draft-view',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule],
  templateUrl: './draft-view.component.html',
})
export class DraftViewComponent implements OnInit, AfterViewInit {
  draft: DraftDto = { id: 0, title: '', content: '', tags: [], createdAt: '', savedAt: '' };
  tagInput = '';
  loading = true;
  errorMessage = '';
  private saveSubject = new Subject<void>();
  @ViewChild('quillEditor', { static: false }) quillEditorRef!: ElementRef;
  private quillInstance: Quill | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private draftService: DraftService,
    private noteService: NoteService
  ) {}

  ngOnInit(): void {

     const tourKey = 'draft-list';
  const localStorageKey = `tour-${tourKey}`;

  if (!localStorage.getItem(localStorageKey)) {
    localStorage.setItem(localStorageKey, 'false');
  }
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.draftService.getById(id).subscribe({
        next: (res: ApiResponse<DraftDto>) => {
          this.draft = res.data ?? this.draft;
          this.loading = false;
          setTimeout(() => this.initEditor());
        },
        error: (err) => {
           if (err.status === 404) {
          this.errorMessage = 'No draft found with that ID.';
        } else {
          this.errorMessage = 'Failed to load draft.';
        }
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
      setTimeout(() => this.initEditor());
    }

    this.saveSubject.pipe(debounceTime(3000)).subscribe(() => this.autoSave());
  }

  ngAfterViewInit(): void {
   this.startEditTour();
  }


   startEditTour(): void {
  const tourKey = 'draft-view';
  const localStorageKey = `tour-${tourKey}`;


  if (localStorage.getItem(localStorageKey) === 'true') return;
 
  const Driver = driver({
    showProgress: true,
    popoverClass: 'driverjs-theme',
  steps: [
  {
    element: '#draft-title',
    popover: {
      title: '📝 Draft Title',
      description: 'Enter a title for your draft. If left empty, it will default to "Untitled".',
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#draft-tag',
    popover: {
      title: '🏷️ Add Tags',
      description: 'Add relevant tags to organize your draft. Press Enter after each tag.',
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#edit-content',
    popover: {
      title: '🧾 Edit Content',
      description: 'This is where you write or edit your draft’s content. Changes are saved automatically.',
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#save-note',
    popover: {
      title: '💾 Save Note',
      description: 'Click to save your note. Once saved, it will be removed from the drafts list.',
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#delete-draft',
    popover: {
      title: '🗑️ Delete Draft',
      description: 'Click to permanently delete this draft. This action cannot be undone.',
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#back',
    popover: {
      title: '↩️ Go Back',
      description: 'No need to manually save—your draft is auto-saved as you type.',
      side: 'top',
      align: 'start'
    }
  }
]

,
    onDestroyed: () => {
      localStorage.setItem(localStorageKey, 'true');
    }
  });

  setTimeout(() => Driver.drive(), 500); 
}

  private initEditor(): void {
    if (!this.quillEditorRef) return;

    const toolbarOptions = [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ header: 1 }, { header: 2 }],
      [{ list: 'ordered' }, { list: 'bullet' }],
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
      placeholder: 'Start writing...',
      modules: {
        toolbar: toolbarOptions
      }
    });

    this.setQuillContent();

    this.quillInstance.on('text-change', () => {
      this.draft.content = this.quillInstance!.root.innerHTML;
      this.triggerSave();
    });
  }

  private setQuillContent(): void {
    if (this.quillInstance && this.draft.content) {
      setTimeout(() => {
        try {
          this.quillInstance!.clipboard.dangerouslyPasteHTML(this.draft.content);
        } catch (e) {
          console.error('Failed to paste HTML into Quill', e);
        }
      });
    }
  }

  onTitleChange(): void {
    this.triggerSave();
  }

  onTagInputKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.tagInput.trim()) {
      event.preventDefault();
      this.draft.tags.push(this.tagInput.trim());
      this.tagInput = '';
      this.triggerSave();
    }
  }

  removeTag(index: number): void {
    this.draft.tags.splice(index, 1);
    this.triggerSave();
  }

  triggerSave(): void {
    this.saveSubject.next();
  }

autoSave(): void {
  if (this.draft) {
    if (!this.draft.title || this.draft.title.trim() === '') {
      this.draft.title = 'Untitled';
    }

    if (this.draft.id) {
      this.draftService.createOrUpdate(this.draft, this.draft.id).subscribe({
        next: () => console.log('Draft auto-saved'),
        error: (err) => console.error('Auto-save failed', err)
      });
    }
  }
}


  saveManually(): void {
    if (this.draft?.id) {
      this.draftService.createOrUpdate(this.draft, this.draft.id).subscribe({
        next: () => console.log('Draft saved'),
        error: (err) => console.error('Manual save failed', err)
      });
    }
  }
  saveNote(): void {
  if (!this.draft) return;

  const newNote = {
    ...this.draft,
    savedAt: new Date().toISOString(), 
  };

  this.noteService.create(newNote).subscribe({
    next: (note) => {
      console.log('Note created successfully:', note);

      
      if (this.draft.id) {
        this.draftService.delete(this.draft.id).subscribe({
          next: () => {
            console.log('Draft deleted');
            this.router.navigate(['/']); 
          },
          error: (err) => {
            console.error('Failed to delete draft:', err);
           
            this.router.navigate(['/notes']);
          }
        });
      }
    },
    error: (err) => {
      console.error('Failed to create note from draft:', err);
    }
  });
}
  deleteDraft(): void {
    if (this.draft?.id) {
      this.draftService.delete(this.draft.id).subscribe({
        next: () => {
          console.log('Draft deleted');
          this.router.navigate(['/drafts']); 
        },
        error: (err) => console.error('Failed to delete draft', err)
      });
    }
  }
}
