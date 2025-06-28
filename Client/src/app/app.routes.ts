import { Routes } from '@angular/router';
import { HomeComponent } from '@/features/home/home.component';
import { NoteListComponent } from '@/features/notes/note-list/note-list.component';
import { DraftListComponent } from '@/features/draft/draft-list/draft-list.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: '',
        component: NoteListComponent,
      },
      {
        path: 'drafts',
        children: [
          {
            path: '',
            component: DraftListComponent,
          },
          {
            path: ':id',
            loadComponent: () =>
              import('@/features/draft/draft-view/draft-view.component').then(
                (m) => m.DraftViewComponent
              ),
          },
        ],
      },
      {
        path: 'notes',
        children: [
          {
            path: 'new',
            loadComponent: () =>
              import('@/features/notes/note-create/note-create.component').then(
                (m) => m.NoteCreateComponent
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('@/features/notes/note-view/note-view.component').then(
                (m) => m.NoteViewComponent
              ),
          },
        ],
      },
    ],
  },
  {
    path: '**',
    component: HomeComponent, 
  },
];
