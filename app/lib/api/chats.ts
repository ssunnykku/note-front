import type { ChatRoom } from '~/features/note/types';
import apiClient from '~/lib/apiClient';

interface ChatRoomResponse {
  id: number;
  // 사용자 메시지가 없는 채팅방은 null
  title: string | null;
  modelId: string | null;
  lastMessage: string | null;
  createdAt: string;
}

interface CreateChatRoomRequest {
  modelId?: string;
}

const DEFAULT_CHAT_TITLE = '새 채팅';
// 백엔드 title(첫 사용자 메시지) 최대 길이
export const CHAT_TITLE_MAX_LENGTH = 50;

const toChatRoom = (room: ChatRoomResponse): ChatRoom => ({
  id: room.id,
  title: room.title ?? DEFAULT_CHAT_TITLE,
  createdAt: room.createdAt,
  lastMessage: room.lastMessage ?? undefined,
  modelId: room.modelId ?? undefined,
});

export const chatsApi = {
  // 본인 채팅방 목록 (생성일 최신순)
  getAll: () =>
    apiClient
      .get<ChatRoomResponse[]>('/chats')
      .then((r) => (Array.isArray(r.data) ? r.data : []).map(toChatRoom)),

  // 채팅방 id는 서버가 발급. 메시지 전송 전에 반드시 생성해야 한다
  create: (data: CreateChatRoomRequest = {}) =>
    apiClient.post<ChatRoomResponse>('/chats', data).then((r) => toChatRoom(r.data)),
};
