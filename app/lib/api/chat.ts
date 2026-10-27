import apiClient from '~/lib/apiClient';

// 백엔드 content 최대 길이
export const MESSAGE_MAX_LENGTH = 10000;

interface SendMessageRequest {
  content: string;
  modelId: string;
}

interface ChatMessageResponse {
  id: number;
  role: 'USER' | 'AI';
  content: string;
  createdAt: string;
}

export interface ChatMessageItem {
  id: number;
  role: 'user' | 'ai';
  content: string;
  createdAt: string;
}

const toChatMessageItem = (message: ChatMessageResponse): ChatMessageItem => ({
  id: message.id,
  role: message.role === 'USER' ? 'user' : 'ai',
  content: message.content,
  createdAt: message.createdAt,
});

export const chatApi = {
  // 오래된 순. 아직 생성되지 않은 채팅방은 []
  getMessages: (chatId: number) =>
    apiClient
      .get<ChatMessageResponse[]>(`/chats/${chatId}/messages`)
      .then((r) => (Array.isArray(r.data) ? r.data : []).map(toChatMessageItem)),

  // 응답은 AI 답변 1건. 실패(503 등) 시 사용자 메시지도 서버에 저장되지 않는다
  sendMessage: (chatId: number, data: SendMessageRequest) =>
    apiClient
      .post<ChatMessageResponse>(`/chats/${chatId}/messages`, data)
      .then((r) => toChatMessageItem(r.data)),
};
