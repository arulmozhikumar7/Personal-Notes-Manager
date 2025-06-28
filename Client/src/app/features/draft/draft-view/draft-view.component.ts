import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DraftService } from '@/core/services/draft.service';
import { DraftDto } from '@/core/models/draft.model';
import { ApiResponse } from '@/core/models/api-response.model';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { NoteService } from '@/core/services/note.service';

@Component({
  selector: 'app-draft-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './draft-view.component.html',
})
export class DraftViewComponent implements OnInit, AfterViewInit {
  draft: DraftDto = { id: 0, title: '', content: '', tags: [], createdAt: '', savedAt: '' };
  tagInput = '';
  loading = true;

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
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.draftService.getById(id).subscribe({
        next: (res: ApiResponse<DraftDto>) => {
          this.draft = res.data ?? this.draft;
          this.loading = false;
          setTimeout(() => this.initEditor()); // Delay init until content is fetched
        },
        error: (err) => {
          console.error('Failed to load draft', err);
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
    // Editor now initialized only after data fetch
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
    savedAt: new Date().toISOString(), // optional: add savedAt timestamp
  };

  this.noteService.create(newNote).subscribe({
    next: (note) => {
      console.log('Note created successfully:', note);

      // Now delete the draft
      if (this.draft.id) {
        this.draftService.delete(this.draft.id).subscribe({
          next: () => {
            console.log('Draft deleted');
            this.router.navigate(['/']); // Navigate to note list or detail
          },
          error: (err) => {
            console.error('Failed to delete draft:', err);
            // Still navigate to notes to avoid blocking UX
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
