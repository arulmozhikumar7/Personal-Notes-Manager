import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DraftService } from '@/core/services/draft.service';
import { DraftDto } from '@/core/models/draft.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-draft-list',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './draft-list.component.html',
})
export class DraftListComponent implements OnInit {
  private draftService = inject(DraftService);
  drafts: DraftDto[] = [];
  loading = false;

  ngOnInit() {
    this.fetchDrafts();
  }

  fetchDrafts() {
    this.loading = true;
    this.draftService.getAll().subscribe({
      next: (res) => {
        this.drafts = res.data ?? [];
        this.loading = false;
      },
      error: () => {
        alert('Failed to load drafts');
        this.loading = false;
      },
    });
  }
}
