import { useCallback, useRef, useState } from 'react';
import { isAxiosError } from 'axios';
import { chatApi } from '~/lib/api/chat';
import type { ChatMessageItem } from '~/lib/api/chat';
import { logError } from '~/lib/logError';

export interface ChatMessageFailure {
  reason: string;
  // 400/404처럼 다시 보내도 실패하는 경우 false
  canRetry: boolean;
  // 서버가 아직 처리 중일 수 있어 재시도 전에 확인 필요
  needsCheck: boolean;
  // 전송 직전 마지막 서버 메시지 id (재시도 시 저장 여부 판정 기준)
  baselineId?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  // 전송 실패한 사용자 메시지 (서버에 저장되지 않음)
  failure?: ChatMessageFailure;
}

export interface MessageSentResult {
  userContent: string;
  aiContent: string;
  modelId: string;
  isFirstMessage: boolean;
}

interface UseChatMessagesOptions {
  onMessageSent?: (chatId: number, result: MessageSentResult) => void;
}

const toChatMessage = (item: ChatMessageItem): ChatMessage => ({
  id: String(item.id),
  role: item.role,
  content: item.content,
  timestamp: new Date(item.createdAt),
});

// 503/500 등: 서버에 저장되지 않은 것이 확실한 실패
const toFailure = (status?: number): ChatMessageFailure => {
  if (status === 400) {
    return { reason: '보낼 수 없는 메시지입니다', canRetry: false, needsCheck: false };
  }
  if (status === 404) {
    return { reason: '채팅방을 찾을 수 없습니다', canRetry: false, needsCheck: false };
  }
  if (status === 503) {
    return { reason: 'AI 서버에 연결하지 못했습니다', canRetry: true, needsCheck: false };
  }
  return { reason: '전송하지 못했습니다', canRetry: true, needsCheck: false };
};

// 확인 시간이 지나도 서버가 처리 중일 때. 재시도 전에 다시 확인한다
const toUnconfirmedFailure = (baselineId: number): ChatMessageFailure => ({
  reason: '전송 결과를 확인하지 못했습니다',
  canRetry: true,
  needsCheck: true,
  baselineId,
});

type SendResult =
  | { status: 'saved'; items: ChatMessage[] }
  | { status: 'pending' }
  | { status: 'absent' }
  | { status: 'unknown' };

// 서버 메시지 id는 증가값. 로컬 임시 메시지(local-*)는 제외
const getLastServerId = (messages: ChatMessage[]) =>
  messages.reduce((max, m) => (m.id.startsWith('local-') ? max : Math.max(max, Number(m.id))), 0);

// 504·네트워크 오류·타임아웃은 서버가 끝까지 처리해 저장했을 수 있어 "결과 불확실"로 본다
const isUncertainStatus = (status?: number) => status === undefined || status === 504;

// AI 응답은 최대 약 125초 (nginx 타임아웃 150초). 그 안에서 저장 여부를 주기적으로 확인
const RESULT_CHECK_TIMEOUT_MS = 150_000;
const RESULT_CHECK_INTERVAL_MS = 5_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isConfirmedUserMessage = (m: ChatMessage) => m.role === 'user' && !m.failure;

// 채팅 메시지 상태를 패널 밖(home)에서 유지해, 패널이 언마운트돼도 진행 중인 응답이 유실되지 않게 한다
const useChatMessages = ({ onMessageSent }: UseChatMessagesOptions = {}) => {
  const [messagesByChat, setMessagesByChat] = useState<Record<number, ChatMessage[]>>({});
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [loadStatusByChat, setLoadStatusByChat] = useState<Record<number, 'loading' | 'error'>>({});
  // 응답 대기 중인 채팅방 (대기 중에는 모든 채팅방에서 전송 막음)
  const [sendingChatId, setSendingChatId] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ chatId: number; text: string } | null>(null);
  // 로드 완료 또는 진행 중인 채팅방 (중복 요청 방지)
  const requestedChatIdsRef = useRef(new Set<number>());

  const updateMessages = (chatId: number, updater: (prev: ChatMessage[]) => ChatMessage[]) => {
    setMessagesByChat((prev) => ({ ...prev, [chatId]: updater(prev[chatId] ?? []) }));
  };

  const setLoadStatus = useCallback((chatId: number, status: 'loading' | 'error' | null) => {
    setLoadStatusByChat((prev) => {
      const next = { ...prev };
      if (status) next[chatId] = status;
      else delete next[chatId];
      return next;
    });
  }, []);

  const ensureLoaded = useCallback(
    (chatId: number) => {
      if (requestedChatIdsRef.current.has(chatId)) return;
      requestedChatIdsRef.current.add(chatId);
      setLoadStatus(chatId, 'loading');
      chatApi
        .getMessages(chatId)
        .then((items) => {
          setMessagesByChat((prev) => ({ ...prev, [chatId]: items.map(toChatMessage) }));
          setLoadStatus(chatId, null);
        })
        .catch((err) => {
          logError('메시지 불러오기 실패', err);
          requestedChatIdsRef.current.delete(chatId);
          setLoadStatus(chatId, 'error');
        });
    },
    [setLoadStatus],
  );

  const setDraft = (chatId: number, value: string) => {
    setDrafts((prev) => ({ ...prev, [chatId]: value }));
  };

  // 서버는 AI 호출 전에 user 메시지를 먼저 저장하고, 실패하면 삭제한다.
  // 그래서 user 메시지 바로 뒤에 AI 메시지가 있어야 성공으로 본다
  const checkSendResult = async (
    chatId: number,
    content: string,
    baselineId: number,
  ): Promise<SendResult> => {
    try {
      const items = (await chatApi.getMessages(chatId)).map(toChatMessage);
      const index = items.findIndex(
        (m) => m.role === 'user' && Number(m.id) > baselineId && m.content === content,
      );
      if (index === -1) return { status: 'absent' };
      if (items[index + 1]?.role === 'ai') return { status: 'saved', items };
      return { status: 'pending' };
    } catch (err) {
      logError('전송 결과 확인 실패', err);
      return { status: 'unknown' };
    }
  };

  const applySavedMessages = (
    chatId: number,
    items: ChatMessage[],
    content: string,
    modelId: string,
    isFirstMessage: boolean,
  ) => {
    setMessagesByChat((prev) => ({ ...prev, [chatId]: items }));
    onMessageSent?.(chatId, {
      userContent: content,
      aiContent: items[items.length - 1].content,
      modelId,
      isFirstMessage,
    });
  };

  const send = async (chatId: number, content: string, modelId: string, excludeId?: string) => {
    if (sendingChatId !== null) return;
    const history = (messagesByChat[chatId] ?? []).filter((m) => m.id !== excludeId);
    const isFirstMessage = !history.some(isConfirmedUserMessage);
    const baselineId = getLastServerId(history);
    const startedAt = Date.now();
    const userMessage: ChatMessage = {
      id: `local-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    updateMessages(chatId, (prev) => [...prev.filter((m) => m.id !== excludeId), userMessage]);
    setNotice(null);
    setSendingChatId(chatId);

    try {
      const reply = await chatApi.sendMessage(chatId, { content, modelId });
      updateMessages(chatId, (prev) => [...prev, toChatMessage(reply)]);
      onMessageSent?.(chatId, {
        userContent: content,
        aiContent: reply.content,
        modelId,
        isFirstMessage,
      });
    } catch (error) {
      logError('메시지 전송 실패', error);
      const status = isAxiosError(error) ? error.response?.status : undefined;
      if (isUncertainStatus(status)) {
        // 실패 표시/재전송 대신 서버 기록을 다시 조회해 반영
        const deadline = startedAt + RESULT_CHECK_TIMEOUT_MS;
        let wasPending = false;
        // 한 번도 조회에 성공하지 못했으면 저장 여부를 알 수 없음
        let wasChecked = false;
        let failure: ChatMessageFailure | null = null;
        while (!failure) {
          const result = await checkSendResult(chatId, content, baselineId);
          if (result.status === 'saved') {
            applySavedMessages(chatId, result.items, content, modelId, isFirstMessage);
            return;
          }
          if (result.status !== 'unknown') wasChecked = true;
          if (result.status === 'pending') wasPending = true;
          // 처리 중이던 메시지가 사라짐 = AI 호출 실패로 서버가 삭제
          if (result.status === 'absent' && wasPending) failure = toFailure();
          else if (Date.now() >= deadline) {
            failure = wasPending || !wasChecked ? toUnconfirmedFailure(baselineId) : toFailure();
          } else await sleep(RESULT_CHECK_INTERVAL_MS);
        }
        const finalFailure = failure;
        updateMessages(chatId, (prev) =>
          prev.map((m) => (m.id === userMessage.id ? { ...m, failure: finalFailure } : m)),
        );
      } else if (status === 409) {
        // 다른 탭 등에서 보낸 이전 전송이 진행 중: 메시지는 저장되지 않았으므로 제거 후 해당 채팅방 입력창으로 복원
        updateMessages(chatId, (prev) => prev.filter((m) => m.id !== userMessage.id));
        setDrafts((prev) => ({ ...prev, [chatId]: prev[chatId] || content }));
        setNotice({ chatId, text: '이전 응답을 기다리는 중입니다. 잠시 후 다시 보내주세요.' });
      } else {
        const failure = toFailure(status);
        updateMessages(chatId, (prev) =>
          prev.map((m) => (m.id === userMessage.id ? { ...m, failure } : m)),
        );
      }
    } finally {
      setSendingChatId(null);
    }
  };

  const retry = async (chatId: number, failed: ChatMessage, modelId: string) => {
    if (sendingChatId !== null || !failed.failure?.canRetry) return;

    if (failed.failure.needsCheck) {
      // 서버가 이미 처리했는지 확인 후, 저장돼 있으면 재전송하지 않고 서버 기록으로 교체
      setSendingChatId(chatId);
      try {
        const baselineId = failed.failure.baselineId ?? 0;
        const result = await checkSendResult(chatId, failed.content, baselineId);
        if (result.status === 'saved') {
          const history = (messagesByChat[chatId] ?? []).filter((m) => m.id !== failed.id);
          const isFirstMessage = !history.some(isConfirmedUserMessage);
          applySavedMessages(chatId, result.items, failed.content, modelId, isFirstMessage);
          return;
        }
        if (result.status === 'pending') {
          setNotice({ chatId, text: '이전 응답을 기다리는 중입니다. 잠시 후 다시 보내주세요.' });
          return;
        }
      } finally {
        setSendingChatId(null);
      }
    }

    send(chatId, failed.content, modelId, failed.id);
  };

  const deleteFailed = (chatId: number, failedId: string) => {
    updateMessages(chatId, (prev) => prev.filter((m) => m.id !== failedId));
  };

  const reload = (chatId: number) => {
    requestedChatIdsRef.current.delete(chatId);
    ensureLoaded(chatId);
  };

  return {
    messagesByChat,
    drafts,
    loadStatusByChat,
    sendingChatId,
    notice,
    ensureLoaded,
    reload,
    setDraft,
    send,
    retry,
    deleteFailed,
  };
};

export type ChatMessagesStore = ReturnType<typeof useChatMessages>;

export default useChatMessages;
