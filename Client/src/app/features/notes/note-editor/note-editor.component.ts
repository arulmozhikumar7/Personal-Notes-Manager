import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Quill from 'quill';
import { ActivatedRoute, Router } from '@angular/router';
import { DraftService } from '@/core/services/draft.service';
import { DraftDto, DraftCreateDto } from '@/core/models/draft.model';

import 'quill/dist/quill.snow.css'; // make sure this is imported

@Component({
  selector: 'app-note-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './note-editor.component.html',
})
export class NoteEditorComponent implements AfterViewInit, OnDestroy {
  private fb = inject(FormBuilder);
  private draftService = inject(DraftService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  @ViewChild('editorContainer', { static: false }) editorContainer?: ElementRef;

  form: FormGroup;
  quillEditor!: Quill;
  draftId!: number;

  constructor() {
    this.form = this.fb.group({
      title: ['', Validators.required],
      content: [''],
    });
  }

  ngAfterViewInit(): void {
    this.draftId = Number(this.route.snapshot.paramMap.get('id'));

    if (this.editorContainer) {
      this.quillEditor = new Quill(this.editorContainer.nativeElement, {
        theme: 'snow',
        modules: {
          toolbar: '#editor-toolbar',
        },
        placeholder: 'Start writing your note...',
      });

      this.loadDraft();

      this.form.get('title')?.valueChanges.subscribe(() => this.saveDraft());
      this.quillEditor.on('text-change', () => this.saveDraft());
    }
  }

  loadDraft(): void {
    this.draftService.getById(this.draftId).subscribe({
      next: (res) => {
        const draft = res.data;
        if (!draft) {
          alert('Draft not found');
          return;
        }

        this.form.patchValue({
          title: draft.title,
          content: draft.content,
        });

        this.quillEditor.root.innerHTML = draft.content;
      },
      error: () => {
        alert('Failed to load draft');
      },
    });
  }

  saveDraft(): void {
    const content = this.quillEditor.root.innerHTML;
    const draft: DraftCreateDto = {
      title: this.form.get('title')?.value || '',
      content,
      tags: [],
    };

    this.draftService.createOrUpdate(draft, this.draftId).subscribe({
      next: () => {},
      error: () => {
        console.warn('Draft save failed');
      },
    });
  }

  saveNote(): void {
    alert('Note saved. Now deleting draft...');
    this.draftService.delete(this.draftId).subscribe({
      next: () => {
        this.router.navigate(['/notes']);
      },
      error: () => {
        alert('Failed to delete draft after saving');
      },
    });
  }

  ngOnDestroy(): void {
    
  }
}
