import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NoteEditorComponent } from './features/notes/note-editor/note-editor.component';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet,NoteEditorComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'Client';
}
