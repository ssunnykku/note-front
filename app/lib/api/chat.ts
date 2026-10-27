import apiClient from '~/lib/apiClient';

interface SendMessageRequest {
  content: string;
  modelId: string;
}

interface SendMessageResponse {
  id: string;
  content: string;
  createdAt: string;
}

export const chatApi = {
  sendMessage: (chatId: number, data: SendMessageRequest) =>
    apiClient.post<SendMessageResponse>(`/chats/${chatId}/messages`, data).then((r) => r.data),
};
