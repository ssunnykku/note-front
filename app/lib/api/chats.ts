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

const DEFAULT_CHAT_TITLE = '새 채팅';

export const chatsApi = {
  // 본인 채팅방 목록 (생성일 최신순)
  getAll: () =>
    apiClient.get<ChatRoomResponse[]>('/chats').then((r) =>
      (Array.isArray(r.data) ? r.data : []).map(
        (room): ChatRoom => ({
          id: room.id,
          title: room.title ?? DEFAULT_CHAT_TITLE,
          createdAt: room.createdAt,
          lastMessage: room.lastMessage ?? undefined,
          modelId: room.modelId ?? undefined,
        }),
      ),
    ),
};
