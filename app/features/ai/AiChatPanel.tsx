import { useState, useRef, useEffect } from 'react';
import Loading from '~/components/ui/Loading';
import { MESSAGE_MAX_LENGTH } from '~/lib/api/chat';
import type { ChatMessage, ChatMessagesStore } from './useChatMessages';

// 서버에 실제로 pull된 모델만 노출한다. Qwen3 14B는 아직 미설치라 제외.
const AI_MODELS = [
  { id: 'qwen3:8b', label: 'Qwen3 8B', color: '#6366f1', icon: '⚡', desc: '빠른 응답 (기본)' },
] as const;

const EMPTY_MESSAGES: ChatMessage[] = [];

interface AiChatPanelProps {
  chatId: number;
  chatTitle: string;
  // 메시지 상태는 home에서 유지 (패널이 언마운트돼도 진행 중인 응답 보존)
  store: ChatMessagesStore;
  onClose: () => void;
  onBack?: () => void;
  selectedModelId?: string;
  onModelChange?: (modelId: string) => void;
}

const AiChatPanel = ({
  chatId,
  chatTitle,
  store,
  onClose,
  onBack,
  selectedModelId = 'qwen3:8b',
  onModelChange,
}: AiChatPanelProps) => {
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { ensureLoaded, sendingChatId, notice } = store;
  const messages = store.messagesByChat[chatId] ?? EMPTY_MESSAGES;
  const input = store.drafts[chatId] ?? '';
  const currentModel = AI_MODELS.find((m) => m.id === selectedModelId) ?? AI_MODELS[0];
  const isLoading = store.loadStatusByChat[chatId] === 'loading';
  const isLoadError = store.loadStatusByChat[chatId] === 'error';
  const isSending = sendingChatId === chatId;
  const isWaitingOtherChat = sendingChatId !== null && !isSending;
  const isInputDisabled = sendingChatId !== null || isLoading || isLoadError;

  useEffect(() => {
    ensureLoaded(chatId);
  }, [chatId, ensureLoaded]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  useEffect(() => {
    if (!isModelDropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isModelDropdownOpen]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isInputDisabled) return;
    store.setDraft(chatId, '');
    store.send(chatId, trimmed, selectedModelId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // 한글 등 조합형 입력 중 Enter로 글자를 조합 확정할 때도 keydown이 발생하므로
    // 조합이 끝나지 않았으면 전송하지 않는다 (안 그러면 마지막 글자가 별도 메시지로 전송됨)
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-950">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 lg:px-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="shrink-0 w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              aria-label="목록으로 돌아가기"
            >
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
          <svg
            className="w-4 h-4 text-accent"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
            />
          </svg>
          <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {chatTitle}
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          aria-label="채팅 닫기"
        >
          <svg
            className="w-5 h-5 text-gray-500 dark:text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 lg:px-6 lg:py-6 space-y-4">
        {isLoading && messages.length === 0 && <Loading />}
        {isLoadError && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-sm text-gray-500 dark:text-gray-400">
            <p>대화를 불러오지 못했습니다</p>
            <button
              onClick={() => store.reload(chatId)}
              className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}
        {!isLoading && !isLoadError && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 gap-3">
            <svg
              className="w-12 h-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
              />
            </svg>
            <p className="text-sm">AI에게 질문해보세요</p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2.5 text-sm ${
                msg.role === 'user'
                  ? 'bg-accent text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
              } ${msg.failure ? 'opacity-60' : ''}`}
            >
              {msg.content}
            </div>
            {msg.failure && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-red-500">{msg.failure.reason}</span>
                {msg.failure.canRetry && (
                  <button
                    onClick={() => store.retry(chatId, msg, selectedModelId)}
                    disabled={isInputDisabled}
                    className="font-medium text-gray-600 dark:text-gray-300 hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    다시 시도
                  </button>
                )}
                <button
                  onClick={() => store.deleteFailed(chatId, msg.id)}
                  className="text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors"
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        ))}
        {isSending && (
          <div className="flex justify-start">
            <div className="max-w-[70%] rounded-lg px-4 py-3 bg-gray-100 dark:bg-gray-800">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-3 lg:px-6 lg:py-4">
        {notice?.chatId === chatId && (
          <p className="mb-2 text-xs text-amber-600 dark:text-amber-400">{notice.text}</p>
        )}
        {/* 모델 선택 */}
        <div className="relative mb-2" ref={dropdownRef}>
          <button
            onClick={() => setIsModelDropdownOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <span
              className="w-4 h-4 rounded flex items-center justify-center text-[10px] shrink-0"
              style={{ backgroundColor: currentModel.color + '20' }}
            >
              {currentModel.icon}
            </span>
            <span>{currentModel.label}</span>
            <svg
              className={`w-3 h-3 text-gray-400 transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 9l6 6 6-6"
              />
            </svg>
          </button>

          {isModelDropdownOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1.5 z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                모델 선택
              </div>
              {AI_MODELS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onModelChange?.(model.id);
                    setIsModelDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 transition-colors ${
                    model.id === selectedModelId
                      ? 'bg-indigo-50 dark:bg-indigo-950/30'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <span
                    className="w-7 h-7 rounded-md flex items-center justify-center text-sm shrink-0"
                    style={{ backgroundColor: model.color + '20' }}
                  >
                    {model.icon}
                  </span>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {model.label}
                    </div>
                    <div className="text-[11px] text-gray-400 dark:text-gray-500">
                      {model.desc}
                    </div>
                  </div>
                  {model.id === selectedModelId && (
                    <svg
                      className="w-4 h-4 text-accent shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M20 6L9 17l-5-5"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-end gap-3">
          <textarea
            value={input}
            onChange={(e) => store.setDraft(chatId, e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isSending
                ? 'AI가 답변을 생성하는 중...'
                : isWaitingOtherChat
                  ? '다른 채팅의 답변을 기다리는 중...'
                  : '메시지를 입력하세요...'
            }
            maxLength={MESSAGE_MAX_LENGTH}
            rows={1}
            disabled={isInputDisabled}
            className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-accent dark:focus:border-accent transition-colors disabled:opacity-60"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isInputDisabled}
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-accent text-white hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="전송"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 12h14M12 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiChatPanel;
