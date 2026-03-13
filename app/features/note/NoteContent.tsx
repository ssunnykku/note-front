import { useState, useEffect, useCallback, useRef } from 'react';
import { marked } from 'marked';
import HelpTooltip from '~/components/ui/HelpModal';
import type { Note } from './types';
import { formatDateTime } from '~/lib/formatDate';

interface NoteContentProps {
  note: Note | null;
  onSave?: (noteId: number, title: string, content: string) => void;
}

const NoteContent = ({ note, onSave }: NoteContentProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [TipTapEditor, setTipTapEditor] = useState<any>(null);
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
    const htmlContent = note.content.includes('<')
      ? note.content
      : (marked.parse(note.content) as string);
    setContent(htmlContent);
    // 로드된 노트 ID를 기록하여 자동저장 방지
    loadedNoteIdRef.current = note.id;
  }, [note]);

  const saveNote = useCallback(() => {
    if (note && onSave) {
      setIsSaving(true);
      onSave(note.id, title, content);
      setLastSaved(new Date());
      setTimeout(() => setIsSaving(false), 500);
    }
  }, [note, title, content, onSave]);

  // 디바운스된 자동 저장으로 대체됨 (아래 handleContentChange 참고)

  // const handleManualSave = () => {
  //   saveNote();
  // };

  // 디바운스된 자동 저장 (타이핑 멈춘 후 1초 뒤 한 번만 저장)
  useEffect(() => {
    if (!note || !onSave) return;

    // 노트 로드 직후에는 저장하지 않음
    if (loadedNoteIdRef.current !== null) {
      loadedNoteIdRef.current = null;
      return;
    }

    // 기존 타이머가 있으면 취소 (타이핑 계속하면 계속 리셋)
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 새 타이머 시작 - 1초 후 저장
    debounceTimerRef.current = setTimeout(() => {
      setIsSaving(true);
      onSave(note.id, title, content);
      setLastSaved(new Date());
      setTimeout(() => setIsSaving(false), 500);
    }, 1000);

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [content, title]); // content나 title이 바뀔 때만 실행

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
      <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-3 bg-white dark:bg-gray-950">
        <div className="flex items-center justify-between gap-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 text-2xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
            placeholder="제목 없음"
          />
          <div className="flex items-center gap-2 shrink-0">
            {/* 도움말 버튼 */}
            <HelpTooltip />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs">
          <span className="text-gray-400 dark:text-gray-500">
            마지막 수정: {formatDateTime(note.updatedAt)}
          </span>
          <span className="text-gray-300 dark:text-gray-700">•</span>
          {isSaving ? (
            <span className="text-gray-500 dark:text-gray-400">저장 중...</span>
          ) : lastSaved ? (
            <span className="text-gray-600 dark:text-gray-300">
              자동 저장됨 ({lastSaved.toLocaleTimeString()})
            </span>
          ) : null}
        </div>
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
