import { useState } from 'react';
import type { Note, Category } from './types';

interface SidebarProps {
  notes: Note[];
  categories: Category[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddNote?: (categoryId: string) => void;
}

const Sidebar = ({ notes, categories, selectedId, onSelect, onAddNote }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    new Set(categories.map((cat) => cat.id)),
  );

  // 노트 추가 시 카테고리 열기
  const handleAddNote = (categoryId: string) => {
    if (onAddNote) {
      onAddNote(categoryId);
      // 카테고리가 닫혀있으면 열기
      if (!openCategories.has(categoryId)) {
        setOpenCategories((prev) => new Set(prev).add(categoryId));
      }
    }
  };

  // 선택된 노트가 속한 카테고리 찾기
  const getSelectedNoteCategory = () => {
    if (!selectedId) return null;
    const selectedNote = notes.find((note) => note.id === selectedId);
    return selectedNote?.categoryId || null;
  };

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
    <aside
      className={`shrink-0 border-r border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900 overflow-y-auto transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                기록
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">{notes.length}</span>
            </div>
            <button
              onClick={() => setIsCollapsed(true)}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors"
              aria-label="사이드바 접기"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-8 h-8 mx-auto flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors"
            aria-label="사이드바 펴기"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
      <div>
        {categories.map((category) => {
          const categoryNotes = getNotesByCategory(category.id);
          const isOpen = openCategories.has(category.id);

          return (
            <div key={category.id}>
              {isCollapsed ? (
                // 접힌 상태: 색상 점만 표시
                <button
                  onClick={() => setIsCollapsed(false)}
                  className="w-full flex items-center justify-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                  title={category.name}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                </button>
              ) : (
                // 펼쳐진 상태: 전체 UI
                <div className="group">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className={`w-full flex items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors ${
                      !isOpen && getSelectedNoteCategory() === category.id
                        ? 'bg-gray-100 dark:bg-gray-800/50'
                        : ''
                    }`}
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
                    <div className="flex items-center gap-2">
                      {onAddNote && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddNote(category.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-all"
                          aria-label="노트 추가"
                        >
                          <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      )}
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {categoryNotes.length}
                      </span>
                    </div>
                  </button>
                </div>
              )}

              {!isCollapsed && isOpen && (
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
