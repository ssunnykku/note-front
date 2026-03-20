import type { Note } from './types';

interface TrashNoteContentProps {
  note: Note | null;
  onRestore?: (noteId: number) => void;
  onPermanentDelete?: (noteId: number) => void;
  onBack?: () => void;
}

const TrashNoteContent = ({
  note,
  onRestore,
  onPermanentDelete,
  onBack,
}: TrashNoteContentProps) => {
  if (!note) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-400 dark:text-gray-500">
        <p className="text-sm">삭제된 메모를 선택하세요</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-3 lg:px-6 bg-white dark:bg-gray-950">
        <div className="flex items-center justify-between gap-4">
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
          <h1 className="flex-1 text-2xl font-bold text-gray-900 dark:text-white truncate">
            {note.title}
          </h1>
          <div className="flex items-center gap-2 shrink-0">
            {onRestore && (
              <button
                onClick={() => onRestore(note.id)}
                className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                복원
              </button>
            )}
            {onPermanentDelete && (
              <button
                onClick={() => onPermanentDelete(note.id)}
                className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                영구 삭제
              </button>
            )}
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          삭제된 메모 (읽기 전용)
        </div>
      </div>

      {/* 컨텐츠 영역 (읽기 전용) */}
      <div className="flex-1 overflow-y-auto px-4 py-4 lg:px-6">
        <div
          className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
          dangerouslySetInnerHTML={{ __html: note.content }}
        />
      </div>
    </div>
  );
};

export default TrashNoteContent;
