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
