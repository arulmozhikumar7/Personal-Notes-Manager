import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NoteService } from '@/core/services/note.service';
import { ApiResponse } from '@/core/models/api-response.model';
import { NoteDto } from '@/core/models/note.model';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

@Component({
  selector: 'app-note-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './note-view.component.html',
})
export class NoteViewComponent implements OnInit, AfterViewInit {
  note: NoteDto = { id: 0, title: '', content: '', tags: [], createdAt: '', savedAt: '', isPinned: false };
  isEditMode = false;
  tagInput = '';
  loading = true;
  
  // Auto-save status
  saveStatus: 'idle' | 'saving' | 'saved' | 'error' = 'idle';

  private saveSubject = new Subject<void>();
  @ViewChild('quillEditor', { static: false }) quillEditorRef!: ElementRef;
  private quillInstance: Quill | null = null;

  constructor(
    private route: ActivatedRoute,
    private noteService: NoteService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.noteService.getById(id).subscribe({
        next: (res: ApiResponse<NoteDto>) => {
          this.note = res.data ?? this.note;
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load note', err);
          this.loading = false;
        }
      });
    } else {
      console.warn('No note ID found in route');
      this.loading = false;
    }

    this.saveSubject.pipe(
      debounceTime(1000)
    ).subscribe(() => this.autoSave());
  }

  ngAfterViewInit(): void {
    if (this.isEditMode) {
      this.initEditor();
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

  toggleEdit(): void {
    this.isEditMode = !this.isEditMode;
    this.saveStatus = 'idle'; // Reset save status when toggling modes

    if (this.quillInstance) {
      this.quillInstance.off('text-change');
      this.quillEditorRef.nativeElement.innerHTML = '';
      this.quillInstance = null;
    }

    if (this.isEditMode) {
      setTimeout(() => this.initEditor());
    }
  }

  onTitleChange(): void {
    this.triggerSave();
  }

  onTagInputKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.tagInput.trim()) {
      event.preventDefault();
      this.note.tags.push(this.tagInput.trim());
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
          console.log('Note auto-saved');
          this.saveStatus = 'saved';
          // Reset to idle after showing saved status for 2 seconds
          setTimeout(() => {
            if (this.saveStatus === 'saved') {
              this.saveStatus = 'idle';
            }
          }, 2000);
        },
        error: (err) => {
          console.error('Auto-save failed', err);
          this.saveStatus = 'error';
          // Reset to idle after showing error status for 3 seconds
          setTimeout(() => {
            if (this.saveStatus === 'error') {
              this.saveStatus = 'idle';
            }
          }, 3000);
        }
      });
    }
  }
}