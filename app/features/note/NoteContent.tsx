import { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import type { ComponentType } from 'react';
import { marked } from 'marked';
import type { Note } from './types';

const emptySubscribe = () => () => {};
const useIsClient = () => useSyncExternalStore(emptySubscribe, () => true, () => false);

interface NoteContentProps {
  note: Note | null;
  onSave?: (noteId: number, title: string, content: string) => Promise<string | void>;
  onDelete?: (noteId: number) => void;
  onBack?: () => void;
  isPending?: boolean;
  categoryName?: string | null;
  categoryColor?: string | null;
}

const NoteContent = ({
  note,
  onSave,
  onDelete,
  onBack,
  isPending,
  categoryName,
  categoryColor,
}: NoteContentProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasEdited, setHasEdited] = useState(false);
  const initialTitleRef = useRef('');
  const initialContentRef = useRef('');
  const isClient = useIsClient();
  const [TipTapEditor, setTipTapEditor] = useState<ComponentType<{
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
  }> | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 클라이언트 사이드에서만 TipTap 로드
    import('./TipTapEditor').then((mod) => {
      setTipTapEditor(() => mod.default);
    });
  }, []);

  const loadedNoteIdRef = useRef<number | null>(null);
  const prevNoteIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!note) return;
    // 같은 노트의 prop 변경(자동저장 후 갱신)은 무시
    if (prevNoteIdRef.current === note.id) return;
    prevNoteIdRef.current = note.id;

    setTitle(note.title);
    // 마크다운을 HTML로 변환
    const rawContent = note.content ?? '';
    const htmlContent = rawContent.includes('<')
      ? rawContent
      : (marked.parse(rawContent) as string);
    setContent(htmlContent);
    // 초기값 저장 (신규 노트 변경 감지용)
    initialTitleRef.current = note.title;
    initialContentRef.current = htmlContent;
    setHasEdited(false);
    setLastSaved(null);
    // 로드된 노트 ID를 기록하여 자동저장 방지
    loadedNoteIdRef.current = note.id;
  }, [note]);

  // 최신 값을 ref에 저장하여 effect deps 문제 방지
  const noteRef = useRef(note);
  const onSaveRef = useRef(onSave);
  noteRef.current = note;
  onSaveRef.current = onSave;

  // 디바운스된 자동 저장 (타이핑 멈춘 후 1초 뒤 한 번만 저장)
  useEffect(() => {
    const currentNote = noteRef.current;
    const currentOnSave = onSaveRef.current;
    if (!currentNote || !currentOnSave) return;

    // 노트 로드 직후에는 저장하지 않음
    if (loadedNoteIdRef.current !== null) {
      loadedNoteIdRef.current = null;
      return;
    }

    // 초기값에서 변경이 없으면 저장하지 않음
    const titleChanged = title !== initialTitleRef.current;
    const contentChanged = content !== initialContentRef.current;
    if (!titleChanged && !contentChanged) return;

    if (!hasEdited) setHasEdited(true);

    // 기존 타이머가 있으면 취소 (타이핑 계속하면 계속 리셋)
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 새 타이머 시작 - 1초 후 저장
    debounceTimerRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        const serverUpdatedAt = await currentOnSave(currentNote.id, title, content);
        setLastSaved(serverUpdatedAt ? new Date(serverUpdatedAt) : new Date());
      } catch (err) {
        console.error('자동 저장 실패:', err);
      } finally {
        setIsSaving(false);
      }
    }, 1000);

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [content, title, isPending]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  if (!note) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-400 dark:text-gray-500">
        <p className="text-sm">메모를 선택하세요</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-3 lg:px-6 bg-white dark:bg-gray-950">
        {onBack && (
          <button
            onClick={onBack}
            className="shrink-0 w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors mb-1"
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
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: categoryColor || '#9ca3af' }}
            />
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {categoryName || '미분류'}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onDelete && note && (
              <button
                onClick={() => onDelete(note.id)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                aria-label="노트 삭제"
              >
                <svg
                  className="w-4.5 h-4.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 text-2xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
          placeholder="제목 없음"
        />
        {isPending && !hasEdited ? (
          <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">작성중</div>
        ) : (
          <div className="flex items-center gap-2 mt-2 text-xs">
            <span className="text-gray-300 dark:text-gray-700">•</span>
            {isSaving ? (
              <span className="text-gray-500 dark:text-gray-400">저장 중...</span>
            ) : lastSaved ? (
              <span className="text-gray-600 dark:text-gray-300">
                자동 저장됨 ({lastSaved.toLocaleTimeString()})
              </span>
            ) : (
              <span className="text-gray-400 dark:text-gray-500">
                자동 저장됨 {isClient && note.updatedAt ? `(${new Date(note.updatedAt).toLocaleTimeString()})` : ''}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 컨텐츠 영역 */}
      <div className="flex-1 flex overflow-hidden">
        {TipTapEditor ? (
          <TipTapEditor content={content} onChange={handleContentChange} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <p>에디터 로딩 중...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteContent;
