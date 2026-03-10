export interface Category {
  id: string;
  name: string;
  notes: Note[];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  categoryId: string;
}

export interface ChatRoom {
  id: string;
  title: string;
  categoryId: string;
  createdAt: string;
}
