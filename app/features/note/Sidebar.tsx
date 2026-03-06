import type { Note } from './types';

interface SidebarProps {
  notes: Note[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const Sidebar = ({ notes, selectedId, onSelect }: SidebarProps) => {
  return (
    <aside className="w-64 shrink-0 border-r border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900 overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          메모
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">{notes.length}</span>
      </div>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            <button
              onClick={() => onSelect(note.id)}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-800 transition-colors ${
                selectedId === note.id
                  ? 'bg-white dark:bg-gray-800'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800/50'
              }`}
            >
              <p
                className={`text-sm font-medium truncate ${
                  selectedId === note.id
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {note.title}
              </p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{note.updatedAt}</p>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
