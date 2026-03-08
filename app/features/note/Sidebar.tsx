import { useState } from 'react';
import type { Note, Category } from './types';

interface SidebarProps {
  notes: Note[];
  categories: Category[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const Sidebar = ({ notes, categories, selectedId, onSelect }: SidebarProps) => {
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    new Set(categories.map((cat) => cat.id)),
  );

  const toggleCategory = (categoryId: string) => {
    setOpenCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const getNotesByCategory = (categoryId: string) => {
    return notes.filter((note) => note.categoryId === categoryId);
  };

  return (
    <aside className="w-64 shrink-0 border-r border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900 overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          메모
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">{notes.length}</span>
      </div>
      <div>
        {categories.map((category) => {
          const categoryNotes = getNotesByCategory(category.id);
          const isOpen = openCategories.has(category.id);

          return (
            <div key={category.id}>
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <svg
                    className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
                      isOpen ? 'rotate-90' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {category.name}
                  </span>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {categoryNotes.length}
                </span>
              </button>

              {isOpen && (
                <ul>
                  {categoryNotes.map((note) => (
                    <li key={note.id}>
                      <button
                        onClick={() => onSelect(note.id)}
                        className={`w-full text-left pl-10 pr-4 py-3 border-b border-gray-100 dark:border-gray-800 transition-colors ${
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
                        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                          {note.updatedAt}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
