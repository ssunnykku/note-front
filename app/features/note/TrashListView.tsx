import type { CategoryNoteItem } from './types';
import { formatDateTime } from '~/lib/formatDate';
import Button from '~/components/ui/Button';

interface TrashListViewProps {
  trashNotes: CategoryNoteItem[];
  onRestore: (noteId: number) => void;
  onPermanentDelete: (noteId: number) => void;
  onBack?: () => void;
}

const stripHtml = (html: string) => {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
};

const TrashListView = ({
  trashNotes,
  onRestore,
  onPermanentDelete,
  onBack,
}: TrashListViewProps) => {
  if (trashNotes.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 gap-3">
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        <p className="text-sm">휴지통이 비어 있습니다</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-4 lg:px-6 bg-white dark:bg-gray-950">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="shrink-0 w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              aria-label="돌아가기"
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
          <div className="flex items-center gap-2">
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">휴지통</h1>
          </div>
          <span className="text-sm text-gray-400 dark:text-gray-500">{trashNotes.length}개</span>
        </div>
      </div>

      {/* 노트 리스트 */}
      <div className="flex-1 overflow-y-auto">
        {trashNotes.map((note) => (
          <div
            key={note.id}
            className="px-4 py-4 lg:px-6 border-b border-gray-100 dark:border-gray-800"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {note.title}
                </h3>
                {note.contentPreview && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-3">
                    {stripHtml(note.contentPreview)}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  삭제일: {note.deletedAt ? formatDateTime(note.deletedAt) : '-'}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onRestore(note.id)}
                >
                  복원
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onPermanentDelete(note.id)}
                >
                  영구 삭제
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrashListView;
