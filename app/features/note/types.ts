export interface CategoryNoteItem {
  id: number;
  categoryId?: number;
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
  categoryId?: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface ChatRoom {
  id: string;
  title: string;
  createdAt: string;
  lastMessage?: string;
  modelId?: string;
}
