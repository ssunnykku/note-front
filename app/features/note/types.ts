export interface Category {
  id: string;
  name: string;
  color?: string;
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
