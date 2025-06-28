import { AfterViewInit, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DraftService } from '@/core/services/draft.service';
import { DraftDto } from '@/core/models/draft.model';
import { RouterModule } from '@angular/router';
import { driver } from 'driver.js';
import "driver.js/dist/driver.css";

@Component({
  selector: 'app-draft-list',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './draft-list.component.html',
})
export class DraftListComponent implements AfterViewInit {
  private draftService = inject(DraftService);
  drafts: DraftDto[] = [];
  loading = false;
  ngAfterViewInit(): void {
      this.fetchDrafts();
    const tourKey = 'draft-list';
  const localStorageKey = `tour-${tourKey}`;

  if (!localStorage.getItem(localStorageKey)) {
    localStorage.setItem(localStorageKey, 'false');
  }
  }
  

   startEditTour(): void {
  const tourKey = 'draft-list';
  const localStorageKey = `tour-${tourKey}`;


  if (localStorage.getItem(localStorageKey) === 'true') return;
 
  const Driver = driver({
    showProgress: true,
    popoverClass: 'driverjs-theme',
   steps: [
  {
    element: '#draft-list',
    popover: {
      title: '📄 View Your Drafts',
      description: 'Here’s a list of all your saved drafts. Click on any draft to continue editing it.',
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#continue-edit',
    popover: {
      title: '✏️ Continue Editing',
      description: 'Click this icon to open and continue editing the selected draft.',
      side: 'top',
      align: 'start'
    }
  },
  {
    element: '#delete',
    popover: {
      title: '🗑️ Delete Draft',
      description: 'Click here to delete the draft. You’ll be asked for confirmation before it’s gone.',
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



  fetchDrafts() {
    this.loading = true;
    this.draftService.getAll().subscribe({
      next: (res) => {
        this.drafts = res.data ?? [];
        this.loading = false;
        if(this.drafts.length>0){
          this.startEditTour();
        }
      },
      error: () => {
        alert('Failed to load drafts');
        this.loading = false;
      },
    });
  }

  deleteDraft(id: number): void {
  const confirmed = confirm('Are you sure you want to delete this draft?');

  if (!confirmed) return;

  this.draftService.delete(id).subscribe({
    next: () => {
      this.drafts = this.drafts.filter(d => d.id !== id); 
    },
    error: () => {
      alert('Failed to delete the draft');
    },
  });
}
}
