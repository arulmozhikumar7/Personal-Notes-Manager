import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {

  resetTour() {
    const tourKeys = [
      'tour-draft-list',
      'tour-draft-view',
      'tour-note-add',
      'tour-note-list',
      'tour-note-view'
    ];

    tourKeys.forEach(key => localStorage.removeItem(key));
    alert('UI tour has been reset.');
  }
}
