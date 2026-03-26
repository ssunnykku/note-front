import type { Note } from '~/features/note/types';
import apiClient from '~/lib/apiClient';

interface CreateNoteRequest {
  userId: string;
  title: string;
  content: string;
  categoryId?: number;
}

interface UpdateNoteRequest {
  title: string;
  content: string;
  categoryId?: number;
}

export const notesApi = {
  getById: (id: number) => apiClient.get<Note>(`/notes/${id}`).then((r) => r.data),

  create: (data: CreateNoteRequest) => apiClient.post<Note>('/notes', data).then((r) => r.data),

  update: (id: number, data: UpdateNoteRequest) =>
    apiClient.put<Note>(`/notes/${id}`, data).then((r) => r.data),

  delete: (id: number) => apiClient.delete(`/notes/${id}`).then((r) => r.data),

  restore: (id: number) => apiClient.patch(`/notes/${id}/restore`).then((r) => r.data),

  permanentDelete: (id: number) =>
    apiClient.delete(`/notes/${id}/permanent`).then((r) => r.data),
};
