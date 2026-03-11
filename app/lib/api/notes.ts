import type { Note } from '~/features/note/types';
import apiClient from '~/lib/apiClient';

interface CreateNoteRequest {
  title: string;
  content: string;
  categoryId: string;
}

type UpdateNoteRequest = Partial<CreateNoteRequest>;

export const notesApi = {
  getAll: (categoryId?: string) =>
    apiClient.get<Note[]>('/notes', { params: { categoryId } }).then((r) => r.data),

  getById: (id: string) => apiClient.get<Note>(`/notes/${id}`).then((r) => r.data),

  create: (data: CreateNoteRequest) =>
    apiClient.post<Note>('/notes', data).then((r) => r.data),

  update: (id: string, data: UpdateNoteRequest) =>
    apiClient.patch<Note>(`/notes/${id}`, data).then((r) => r.data),

  delete: (id: string) => apiClient.delete(`/notes/${id}`).then((r) => r.data),
};
