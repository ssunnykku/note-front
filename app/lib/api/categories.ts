import type { Category, Note } from '~/features/note/types';
import apiClient from '~/lib/apiClient';

interface CreateCategoryRequest {
  name: string;
}

interface EditCategoryRequest {
  name: string;
}

interface CreateCategoryResponse {
  id: number;
  name: string;
}

export const categoriesApi = {
  getAll: (deleted: boolean = false) =>
    apiClient.get<Category[]>('/categories/notes', { params: { deleted } }).then((r) => r.data),

  getNotesByCategory: (categoryId: number | null, deleted: boolean = false) => {
    const params: Record<string, string> = { deleted: String(deleted) };
    if (categoryId !== null) params.categoryId = String(categoryId);
    return apiClient.get<Note[]>('/categories', { params }).then((r) => r.data);
  },

  getNotesUncategorized: (deleted: boolean = false) => {
    const params: Record<string, string> = { deleted: String(deleted) };
    return apiClient.get<Note[]>('/categories', { params }).then((r) => r.data);
  },

  create: (data: CreateCategoryRequest) =>
    apiClient.post<CreateCategoryResponse>('/categories', data).then((r) => ({
      id: r.data.id,
      categoryName: r.data.name,
      notes: [],
    })),

  update: (id: number, data: EditCategoryRequest) =>
    apiClient.patch<Category>(`/categories/${id}`, data).then((r) => r.data),

  delete: (id: number) => apiClient.delete(`/categories/${id}`).then((r) => r.data),
};
