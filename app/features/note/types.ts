export interface CategoryNoteItem {
  id: number;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  contentPreview?: string;
}

export interface Category {
  id: number;
  categoryName: string;
  notes: CategoryNoteItem[];
}

export interface Note {
  id: number;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface ChatRoom {
  id: string;
  title: string;
  categoryId: number;
  createdAt: string;
}
