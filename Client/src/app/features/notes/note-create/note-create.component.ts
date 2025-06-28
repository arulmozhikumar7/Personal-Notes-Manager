import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  AfterViewInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import Quill from 'quill';
import 'quill/dist/quill.snow.css';

import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

import { NoteCreateDto } from '@/core/models/note.model';
import { DraftCreateDto } from '@/core/models/draft.model';
import { NoteService } from '@/core/services/note.service';
import { DraftService } from '@/core/services/draft.service';

@Component({
  selector: 'app-note-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './note-create.component.html',
})
export class NoteCreateComponent implements OnInit, OnDestroy, AfterViewInit {
  note: NoteCreateDto = { title: '', content: '', tags: [] };
  tagInput = '';
  draftId: number | null = null;
  private quill!: Quill;
  private autoSaveTimer!: ReturnType<typeof setTimeout>;
  private readonly localDraftKey = 'unsaved_note_draft';
  private autoSaveEnabled = true;

  @ViewChild('editorRef') editorRef!: ElementRef;

  private noteService = inject(NoteService);
  private draftService = inject(DraftService);
  private router = inject(Router);

  ngOnInit(): void {
    this.initEditor();
    this.loadLocalDraft();
  }

  ngAfterViewInit(): void {
    const tourKey = 'note-add';
    const localStorageKey = `tour-${tourKey}`;
    if (!localStorage.getItem(localStorageKey)) {
      localStorage.setItem(localStorageKey, 'false');
    }
    if (localStorage.getItem(localStorageKey) === 'true') return;
    this.startTour();
  }

  ngOnDestroy(): void {
    this.saveToLocalStorage();
  }

  @HostListener('window:beforeunload')
  onUnload(): void {
    this.saveToLocalStorage();
  }

  private initEditor(): void {
    this.quill = new Quill('#editor', {
      theme: 'snow',
      placeholder: 'Write something...',
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ align: [] }],
          ['link', 'image', 'blockquote', 'code-block'],
          [{ color: [] }, { background: [] }],
          ['clean'],
        ],
      },
    });

    this.quill.on('text-change', () => {
      this.note.content = this.quill.root.innerHTML;
      this.scheduleAutoSave();
    });
  }

  private scheduleAutoSave(): void {
    if (!this.autoSaveEnabled) return;
    clearTimeout(this.autoSaveTimer);
    this.autoSaveTimer = setTimeout(() => this.saveToLocalStorage(), 1000);
  }

  private saveToLocalStorage(): void {
    const title = this.note.title.trim();
    const content = this.quill.root.innerHTML.trim();
    const hasTags = this.note.tags.length > 0;

    const shouldSave =
      !!title ||
      !!content.replace(/<(.|\n)*?>/g, '').trim() ||
      hasTags;

    if (shouldSave && this.autoSaveEnabled) {
      const data: NoteCreateDto = {
        title: title || 'Untitled',
        content,
        tags: this.note.tags,
      };
      localStorage.setItem(this.localDraftKey, JSON.stringify(data));
    } else {
      localStorage.removeItem(this.localDraftKey);
    }
  }

  private loadLocalDraft(): void {
    const draftJson = localStorage.getItem(this.localDraftKey);
    if (draftJson) {
      const shouldRestore = confirm('You have an unsaved note. Restore it?');
      if (shouldRestore) {
        const localDraft: NoteCreateDto = JSON.parse(draftJson);
        this.note = {
          title: localDraft.title,
          content: localDraft.content,
          tags: localDraft.tags ?? [],
        };
        setTimeout(() => {
          this.quill.root.innerHTML = localDraft.content || '';
        });
      } else {
        localStorage.removeItem(this.localDraftKey);
      }
    }
  }

  addTag(event: Event): void {
  const keyboardEvent = event as KeyboardEvent;
  const newTag = this.tagInput.trim();

  if (!newTag) return;
  const tagExists = this.note.tags.some(tag => tag.toLowerCase() === newTag.toLowerCase());
  if (tagExists) {
    this.tagInput = '';
    return;
  }

  this.note.tags.push(newTag);
  this.tagInput = '';
  this.scheduleAutoSave();
}

  removeTag(index: number): void {
    this.note.tags.splice(index, 1);
    this.scheduleAutoSave();
  }

  clear(): void {
    this.note = { title: '', content: '', tags: [] };
    this.tagInput = '';
    this.quill.setText('');
    localStorage.removeItem(this.localDraftKey);
  }

  cancel(): void {
    localStorage.removeItem(this.localDraftKey);
    if (this.draftId) {
      this.draftService.delete(this.draftId).subscribe(() => {
        this.router.navigate(['/']);
      });
    } else {
      this.router.navigate(['/']);
    }
  }

  saveNote(): void {
    this.note.content = this.quill.root.innerHTML;
    const plainText = this.quill.getText().trim();

    if (!plainText) {
      alert('Note content is required.');
      return;
    }

    if (!this.note.title.trim()) this.note.title = 'Untitled';
    this.autoSaveEnabled = false;

    this.noteService.create(this.note).subscribe(() => {
      localStorage.removeItem(this.localDraftKey);
      if (this.draftId) {
        this.draftService.delete(this.draftId).subscribe(() => {
          this.router.navigate(['/']);
        });
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  saveAsDraft(): void {
    this.note.content = this.quill.root.innerHTML;
    if (!this.note.title.trim()) this.note.title = 'Untitled';

    const draft: DraftCreateDto = {
      title: this.note.title,
      content: this.note.content,
      tags: this.note.tags,
    };

    this.draftService.createOrUpdate(draft, this.draftId || undefined).subscribe((res) => {
      if (!this.draftId && res.data?.id) this.draftId = res.data.id;
      localStorage.removeItem(this.localDraftKey);
    });

    this.router.navigate(['/drafts']);
  }

  private startTour(): void {
    const tourKey = 'note-add';
    const localStorageKey = `tour-${tourKey}`;

    const driverObj = driver({
      showProgress: true,
      popoverClass: 'driverjs-theme',
      steps: [
        {
          element: '#add-title',
          popover: {
            title: 'Note Title',
            description: 'Start by entering a descriptive title for your note.',
            side: 'top',
            align: 'start',
          },
        },
        {
          element: '#add-tags',
          popover: {
            title: 'Tag Your Note',
            description: 'Add relevant tags and press Enter to categorize your note.',
            side: 'top',
            align: 'start',
          },
        },
        {
          element: '#add-content',
          popover: {
            title: 'Write Content',
            description: 'Use the toolbar to format text, insert links, or add images.',
            side: 'top',
            align: 'start',
          },
        },
        {
          element: '#save',
          popover: {
            title: 'Save Note',
            description: 'Click here to save your note permanently.',
            side: 'top',
            align: 'start',
          },
        },
        {
          element: '#draft',
          popover: {
            title: 'Save as Draft',
            description: 'Use this to save your note without publishing it.',
            side: 'top',
            align: 'start',
          },
        },
        {
          element: '#clear',
          popover: {
            title: 'Clear Note',
            description: 'Click to clear all input fields and start fresh.',
            side: 'top',
            align: 'start',
          },
        },
        {
          element: '#cancel',
          popover: {
            title: 'Cancel Changes',
            description: 'Discard current changes and return to the previous screen.',
            side: 'top',
            align: 'start',
          },
        },
        {
          popover: {
            title: '🎉 You Made It!',
            description:
              'Even if you hit refresh or close the tab 😅 — don’t worry, your notes are safely tucked away !',
          },
        },
      ],
      onDestroyed: () => {
        localStorage.setItem(localStorageKey, 'true');
      },
    });

    setTimeout(() => driverObj.drive(), 300);
  }
}
