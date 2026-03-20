import type { Category } from '~/features/note/types';
import apiClient from '~/lib/apiClient';

interface CreateCategoryRequest {
  name: string;
}

interface CreateCategoryResponse {
  id: number;
  name: string;
}

export const categoriesApi = {
  getAll: (userId: string) =>
    apiClient.get<Category[]>(`/categories/${userId}/notes`).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<Category>(`/categories/${id}`).then((r) => r.data),

  create: (data: CreateCategoryRequest) =>
    apiClient.post<CreateCategoryResponse>('/categories', data).then((r) => ({
      id: r.data.id,
      categoryName: r.data.name,
      notes: [],
    })),

  update: (id: string, data: CreateCategoryRequest) =>
    apiClient.patch<Category>(`/categories/${id}`, data).then((r) => r.data),

  delete: (id: string) => apiClient.delete(`/categories/${id}`).then((r) => r.data),
};
