export interface NoteDto {
  id: number;
  title: string;
  content: string;
  savedAt: string;
  createdAt: string;
  isPinned: boolean;
  tags: string[];
}

export interface NoteCreateDto {
  title: string;
  content: string;
  tags: string[];
}

export interface NoteUpdateDto {
  title: string;
  content: string;
  tags: string[];
}