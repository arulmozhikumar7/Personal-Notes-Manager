export interface DraftDto {
  id: number;
  title: string;
  content: string;
  tags: string[];
  savedAt: string;
  createdAt: string;
}

export interface DraftCreateDto {
  title: string;
  content: string;
  tags: string[];
}

export interface DraftNote {
  title: string;
  content: string;
  tags: string[];
}
