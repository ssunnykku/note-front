import Markdown from 'react-markdown';
import type { Note } from './types';

interface NoteContentProps {
  note: Note | null;
}

const NoteContent = ({ note }: NoteContentProps) => {
  if (!note) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-400 dark:text-gray-500">
        <p className="text-sm">메모를 선택하세요</p>
      </div>
    );
  }

  return (
    <article className="flex-1 overflow-y-auto px-12 py-10">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{note.title}</h1>
      <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
        마지막 수정: {note.updatedAt}
      </p>
      <div className="prose dark:prose-invert mt-8 max-w-none">
        <Markdown>{note.content}</Markdown>
      </div>
    </article>
  );
};

export default NoteContent;
