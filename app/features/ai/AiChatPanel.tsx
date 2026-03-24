import { useState, useRef, useEffect, useMemo } from 'react';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const AI_MODELS = [
  { id: 'dev', label: '개발', color: '#6366f1', icon: '💻', desc: '프로그래밍·개발 질문 특화' },
  { id: 'study', label: '학습', color: '#f59e0b', icon: '📚', desc: '공부·학습 도우미' },
  { id: 'fitness', label: '운동', color: '#10b981', icon: '💪', desc: '운동·건강 관리 특화' },
  { id: 'writing', label: '글쓰기', color: '#ec4899', icon: '✍️', desc: '문서·글쓰기 도우미' },
  { id: 'daily', label: '일상', color: '#8b5cf6', icon: '☀️', desc: '일상 대화·일정 관리' },
] as const;

interface AiChatPanelProps {
  chatId: string;
  chatTitle: string;
  onClose: () => void;
  onBack?: () => void;
  selectedModelId?: string;
  onModelChange?: (modelId: string) => void;
  onLastMessageUpdate?: (chatId: string, message: string) => void;
}

const AiChatPanel = ({
  chatId,
  chatTitle,
  onClose,
  onBack,
  selectedModelId = 'gpt-4o',
  onModelChange,
  onLastMessageUpdate,
}: AiChatPanelProps) => {
  const [messagesByChat, setMessagesByChat] = useState<Record<string, ChatMessage[]>>({});
  const [input, setInput] = useState('');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const messages = useMemo(() => messagesByChat[chatId] ?? [], [messagesByChat, chatId]);
  const currentModel = AI_MODELS.find((m) => m.id === selectedModelId) ?? AI_MODELS[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessagesByChat((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] ?? []), userMessage],
    }));
    setInput('');
    onLastMessageUpdate?.(chatId, trimmed);

    // AI 응답 시뮬레이션
    setTimeout(() => {
      const aiContent = `"${trimmed}"에 대한 답변을 준비 중입니다. (AI 연동 예정)`;
      const aiMessage: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'ai',
        content: aiContent,
        timestamp: new Date(),
      };
      setMessagesByChat((prev) => ({
        ...prev,
        [chatId]: [...(prev[chatId] ?? []), aiMessage],
      }));
      onLastMessageUpdate?.(chatId, aiContent);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
        {messages.length === 0 && (
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
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2.5 text-sm ${
                msg.role === 'user'
                  ? 'bg-accent text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-3 lg:px-6 lg:py-4">
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
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            rows={1}
            className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-accent dark:focus:border-accent transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
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
