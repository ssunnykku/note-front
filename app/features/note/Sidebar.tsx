import { useState, useRef, useEffect } from 'react';
import type { Category, CategoryNoteItem, ChatRoom } from './types';
import Palette from '~/lib/palette';
import { formatDateTime } from '~/lib/formatDate';

const MAX_CHATS_PER_CATEGORY = 5;

interface SidebarProps {
  categories: Category[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onAddNote?: (categoryId: number) => void;
  onAddCategory?: (name: string) => void;
  onDeleteNote?: (noteId: number) => void;
  onQuickMemo?: () => void;
  uncategorizedNotes?: CategoryNoteItem[];
  trashNoteCount?: number;
  onOpenTrash?: () => void;
  isTrashActive?: boolean;
  pendingNoteIds?: Set<number>;
  isChatOpen: boolean;
  onToggleChat: () => void;
  chatRooms: ChatRoom[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onAddChat: (categoryId: number) => void;
  onRenameChat: (chatId: string, title: string) => void;
  forceMobile?: boolean;
}

const getCategoryColor = (index: number) => {
  return Palette.CategoryColors[index % Palette.CategoryColors.length];
};

const Sidebar = ({
  categories,
  selectedId,
  onSelect,
  onAddNote,
  onAddCategory,
  onDeleteNote,
  onQuickMemo,
  uncategorizedNotes = [],
  trashNoteCount = 0,
  onOpenTrash,
  isTrashActive,
  pendingNoteIds,
  isChatOpen,
  onToggleChat,
  chatRooms,
  selectedChatId,
  onSelectChat,
  onAddChat,
  onRenameChat,
  forceMobile,
}: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const newCategoryInputRef = useRef<HTMLInputElement>(null);
  const [isUncategorizedOpen, setIsUncategorizedOpen] = useState(true);

  useEffect(() => {
    if (editingChatId) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [editingChatId]);

  useEffect(() => {
    if (isAddingCategory) {
      newCategoryInputRef.current?.focus();
    }
  }, [isAddingCategory]);

  const commitNewCategory = () => {
    if (newCategoryName.trim() && onAddCategory) {
      onAddCategory(newCategoryName.trim());
    }
    setIsAddingCategory(false);
    setNewCategoryName('');
  };

  const cancelNewCategory = () => {
    setIsAddingCategory(false);
    setNewCategoryName('');
  };

  const startRename = (chatId: string, currentTitle: string) => {
    setEditingChatId(chatId);
    setEditingTitle(currentTitle);
  };

  const commitRename = () => {
    if (editingChatId && editingTitle.trim()) {
      onRenameChat(editingChatId, editingTitle.trim());
    }
    setEditingChatId(null);
    setEditingTitle('');
  };

  const cancelRename = () => {
    setEditingChatId(null);
    setEditingTitle('');
  };
  const [openCategories, setOpenCategories] = useState<Set<number>>(
    new Set(categories.map((cat) => cat.id)),
  );
  const [openChatCategories, setOpenChatCategories] = useState<Set<number>>(
    new Set(categories.map((cat) => cat.id)),
  );

  const handleAddNote = (categoryId: number) => {
    if (onAddNote) {
      onAddNote(categoryId);
      if (!openCategories.has(categoryId)) {
        setOpenCategories((prev) => new Set(prev).add(categoryId));
      }
    }
  };

  const handleAddChat = (categoryId: number) => {
    const categoryChats = chatRooms.filter((c) => c.categoryId === categoryId);
    if (categoryChats.length >= MAX_CHATS_PER_CATEGORY) return;
    onAddChat(categoryId);
    if (!openChatCategories.has(categoryId)) {
      setOpenChatCategories((prev) => new Set(prev).add(categoryId));
    }
  };

  const getSelectedNoteCategory = () => {
    if (!selectedId) return null;
    const cat = categories.find((c) => c.notes.some((n) => n.id === selectedId));
    return cat?.id || null;
  };

  const toggleCategory = (categoryId: number) => {
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

  const toggleChatCategory = (categoryId: number) => {
    setOpenChatCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const getChatsByCategory = (categoryId: number) => {
    return chatRooms.filter((chat) => chat.categoryId === categoryId);
  };

  const isMobile = !!forceMobile;
  const effectiveCollapsed = isMobile ? false : isCollapsed;

  const totalNoteCount =
    categories.reduce((sum, cat) => sum + cat.notes.length, 0) + uncategorizedNotes.length;

  // 노트 항목 렌더링
  const renderNoteItem = (note: CategoryNoteItem) => {
    const isSelected = selectedId === note.id;

    return (
      <li key={note.id}>
        <div className="group/note relative">
          <button
            onClick={() => onSelect(note.id)}
            className={`w-full text-left pl-10 pr-4 py-3 border-b border-gray-100 dark:border-gray-800 transition-colors ${
              isSelected
                ? 'bg-white dark:bg-gray-800'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800/50'
            }`}
          >
            <p
              className={`text-sm font-medium truncate pr-6 ${
                isSelected
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {note.title}
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              {pendingNoteIds?.has(note.id)
                ? '작성중'
                : formatDateTime(note.updatedAt)}
            </p>
          </button>
          {onDeleteNote && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteNote(note.id);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover/note:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-all"
              aria-label="노트 삭제"
            >
              <svg
                className="w-3.5 h-3.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
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
      </li>
    );
  };

  return (
    <aside
      className={`shrink-0 h-full border-r border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900 flex flex-col transition-all duration-300 ${
        isMobile ? 'w-full' : effectiveCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* 상단 토글 버튼 + 접기 버튼 */}
      <div className="flex items-center justify-between px-4 py-3">
        {isMobile ? (
          <button
            onClick={onToggleChat}
            className="flex items-center gap-1.5 px-2 py-1 rounded transition-colors hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            {isChatOpen ? (
              <>
                <svg
                  className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  기록
                </span>
              </>
            ) : (
              <>
                <svg
                  className="w-3.5 h-3.5 text-accent"
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
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  AI 채팅
                </span>
              </>
            )}
          </button>
        ) : !effectiveCollapsed ? (
          <>
            <button
              onClick={onToggleChat}
              className="flex items-center gap-1.5 px-2 py-1 rounded transition-colors hover:bg-gray-200 dark:hover:bg-gray-800"
            >
              {isChatOpen ? (
                <>
                  <svg
                    className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    기록
                  </span>
                </>
              ) : (
                <>
                  <svg
                    className="w-3.5 h-3.5 text-accent"
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
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    AI 채팅
                  </span>
                </>
              )}
            </button>
            <button
              onClick={() => setIsCollapsed(true)}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors"
              aria-label="사이드바 접기"
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
          </>
        ) : (
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-8 h-8 mx-auto flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors"
            aria-label="사이드바 펴기"
          >
            <svg
              className="w-5 h-5 text-gray-600 dark:text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {isChatOpen ? (
        /* ======= 채팅 모드 ======= */
        <div className="flex-1 overflow-y-auto">
          {!effectiveCollapsed && (
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                채팅 목록
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">{chatRooms.length}</span>
            </div>
          )}
          <div>
            {categories.map((category, categoryIndex) => {
              const categoryChats = getChatsByCategory(category.id);
              const isOpen = openChatCategories.has(category.id);
              const canAdd = categoryChats.length < MAX_CHATS_PER_CATEGORY;
              const color = getCategoryColor(categoryIndex);

              return (
                <div key={category.id}>
                  {effectiveCollapsed ? (
                    <button
                      onClick={() => setIsCollapsed(false)}
                      className="w-full flex items-center justify-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                      title={category.categoryName}
                    >
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    </button>
                  ) : (
                    <div className="group">
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleChatCategory(category.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleChatCategory(category.id);
                          }
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${
                          !isOpen &&
                          selectedChatId &&
                          categoryChats.some((c) => c.id === selectedChatId)
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
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {category.categoryName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {canAdd && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddChat(category.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-all"
                              aria-label="채팅 추가"
                            >
                              <svg
                                className="w-4 h-4 text-gray-600 dark:text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                            </button>
                          )}
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {categoryChats.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {!isCollapsed && isOpen && (
                    <ul>
                      {categoryChats.map((chat) => (
                        <li key={chat.id}>
                          <div
                            onClick={() => onSelectChat(chat.id)}
                            onDoubleClick={() => startRename(chat.id, chat.title)}
                            className={`w-full text-left pl-10 pr-4 py-3 border-b border-gray-100 dark:border-gray-800 transition-colors cursor-pointer ${
                              selectedChatId === chat.id
                                ? 'bg-white dark:bg-gray-800'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800/50'
                            }`}
                          >
                            {editingChatId === chat.id ? (
                              <input
                                ref={editInputRef}
                                type="text"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onBlur={commitRename}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') commitRename();
                                  if (e.key === 'Escape') cancelRename();
                                }}
                                onClick={(e) => e.stopPropagation()}
                                onDoubleClick={(e) => e.stopPropagation()}
                                className="w-full text-sm font-medium bg-transparent border-b border-accent outline-none text-gray-900 dark:text-white"
                              />
                            ) : (
                              <p
                                className={`text-sm font-medium truncate ${
                                  selectedChatId === chat.id
                                    ? 'text-gray-900 dark:text-white'
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}
                              >
                                {chat.title}
                              </p>
                            )}
                            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                              {formatDateTime(chat.createdAt)}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ======= 노트 모드 ======= */
        <div className="flex-1 overflow-y-auto">
          {/* 빠른 메모 버튼 */}
          {!effectiveCollapsed && onQuickMemo && (
            <div className="px-3 pb-2">
              <button
                onClick={onQuickMemo}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                빠른 메모
              </button>
            </div>
          )}

          {!effectiveCollapsed && (
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                기록
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">{totalNoteCount}</span>
            </div>
          )}

          {/* 미분류 섹션 */}
          {!effectiveCollapsed && uncategorizedNotes.length > 0 && (
            <div>
              <div className="group">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setIsUncategorizedOpen((prev) => !prev)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setIsUncategorizedOpen((prev) => !prev);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${
                    !isUncategorizedOpen &&
                    selectedId !== null &&
                    uncategorizedNotes.some((n) => n.id === selectedId)
                      ? 'bg-gray-100 dark:bg-gray-800/50'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg
                      className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
                        isUncategorizedOpen ? 'rotate-90' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    <svg
                      className="w-4 h-4 text-gray-400 dark:text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      미분류
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {uncategorizedNotes.length}
                  </span>
                </div>
              </div>
              {isUncategorizedOpen && (
                <ul>{uncategorizedNotes.map((note) => renderNoteItem(note))}</ul>
              )}
            </div>
          )}

          {/* 카테고리 목록 */}
          <div>
            {categories.map((category, categoryIndex) => {
              const isOpen = openCategories.has(category.id);
              const color = getCategoryColor(categoryIndex);

              return (
                <div key={category.id}>
                  {effectiveCollapsed ? (
                    <button
                      onClick={() => setIsCollapsed(false)}
                      className="w-full flex items-center justify-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                      title={category.categoryName}
                    >
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                    </button>
                  ) : (
                    <div className="group">
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleCategory(category.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleCategory(category.id);
                          }
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${
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
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {category.categoryName}
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
                              <svg
                                className="w-4 h-4 text-gray-600 dark:text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                            </button>
                          )}
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {category.notes.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {!isCollapsed && isOpen && (
                    <ul>{category.notes.map((note) => renderNoteItem(note))}</ul>
                  )}
                </div>
              );
            })}

            {/* 인라인 카테고리 입력 행 */}
            {!effectiveCollapsed && isAddingCategory && (
              <div className="flex items-center gap-2 px-4 py-2">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getCategoryColor(categories.length) }}
                />
                <input
                  ref={newCategoryInputRef}
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onBlur={commitNewCategory}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitNewCategory();
                    if (e.key === 'Escape') cancelNewCategory();
                  }}
                  placeholder="카테고리 이름"
                  className="flex-1 min-w-0 text-sm font-medium bg-transparent border-b border-gray-400 dark:border-gray-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
                />
              </div>
            )}
          </div>

          {/* 휴지통 버튼 */}
          {!effectiveCollapsed && onOpenTrash && (
            <div className="mt-2 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={onOpenTrash}
                className={`w-full flex items-center justify-between px-4 py-2 transition-colors cursor-pointer ${
                  isTrashActive
                    ? 'bg-gray-100 dark:bg-gray-800'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-gray-400 dark:text-gray-500"
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
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    휴지통
                  </span>
                </div>
                {trashNoteCount > 0 && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {trashNoteCount}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* + New Category 버튼 */}
      {!effectiveCollapsed && onAddCategory && !isAddingCategory && !isChatOpen && (
        <div className="shrink-0 border-t border-gray-200 dark:border-gray-800 p-3">
          <button
            onClick={() => setIsAddingCategory(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Category
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
