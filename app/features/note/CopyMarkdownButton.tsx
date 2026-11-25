import { useEffect, useRef, useState } from 'react';
import htmlToMarkdown from './htmlToMarkdown';

interface CopyMarkdownButtonProps {
  getHtml: () => string;
}

const CopyMarkdownButton = ({ getHtml }: CopyMarkdownButtonProps) => {
  const [status, setStatus] = useState<'copied' | 'failed' | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const handleCopy = async () => {
    let next: 'copied' | 'failed' = 'copied';
    try {
      await navigator.clipboard.writeText(htmlToMarkdown(getHtml()));
    } catch {
      // http 접속이나 권한 거부 시 클립보드 API가 막힌다
      next = 'failed';
    }
    setStatus(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setStatus(null), 1500);
  };

  return (
    <div className="absolute top-3 right-4 flex items-center gap-1.5">
      {status && (
        <span
          role="status"
          className={`rounded px-2 py-0.5 text-xs ${
            status === 'failed'
              ? 'bg-red-500 text-white'
              : 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
          }`}
        >
          {status === 'copied' ? '복사됨' : '복사 실패'}
        </span>
      )}
      <button
        type="button"
        onClick={handleCopy}
        title="마크다운으로 복사"
        aria-label="마크다운으로 복사"
        className="flex h-8 w-8 items-center justify-center rounded bg-white/80 text-gray-400 backdrop-blur transition-colors hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-950/80 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
      >
        {status === 'copied' ? (
          <svg
            className="h-4 w-4 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="8" y="8" width="12" height="12" rx="2" strokeWidth={2} />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2"
            />
          </svg>
        )}
      </button>
    </div>
  );
};

export default CopyMarkdownButton;
