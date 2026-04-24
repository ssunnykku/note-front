import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router';
import Sidebar from '~/features/note/Sidebar';
import NoteContent from '~/features/note/NoteContent';
import TrashListView from '~/features/note/TrashListView';
import AiChatPanel from '~/features/ai/AiChatPanel';
import { categoriesApi } from '~/lib/api/categories';
import { notesApi } from '~/lib/api/notes';
import Palette from '~/lib/palette';
import type { Note, Category, CategoryNoteItem, ChatRoom } from '~/features/note/types';


interface LayoutContext {
  isMobile: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function meta() {
  return [{ title: 'Note' }, { name: 'description', content: '노트 작성 서비스' }];
}

export default function Home() {
  const { isMobile, sidebarOpen, setSidebarOpen } = useOutletContext<LayoutContext>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [uncategorizedNotes, setUncategorizedNotes] = useState<CategoryNoteItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'editor' | 'chat'>('list');
  const [trashNotes, setTrashNotes] = useState<CategoryNoteItem[]>([]);
  const [isTrashView, setIsTrashView] = useState(false);

  useEffect(() => {
    categoriesApi
      .getAll()
      .then((data) => {
        setCategories(data);
        const allNotes = data.flatMap((cat) => cat.notes);
        if (allNotes.length > 0) {
          setSelectedId((prev) => prev ?? allNotes[0].id);
        }
      })
      .catch((err) => {
        console.error('카테고리 로딩 실패:', err);
      });

    // 미분류 노트 조회 (categoryId = null)
    categoriesApi
      .getNotesUncategorized()
      .then((notes) => {
        setUncategorizedNotes(
          notes.map((n) => ({
            id: n.id,
            categoryId: n.categoryId,
            title: n.title,
            createdAt: n.createdAt,
            updatedAt: n.updatedAt,
          })),
        );
      })
      .catch(() => {});

  }, []);

  useEffect(() => {
    if (selectedId === null) return;
    notesApi
      .getById(selectedId)
      .then(setSelectedNote)
      .catch(() => setSelectedNote(null));
  }, [selectedId]);

  const selectedChat = chatRooms.find((c) => c.id === selectedChatId) ?? null;

  const handleSaveNote = async (
    noteId: number,
    title: string,
    content: string,
  ): Promise<string | void> => {
    try {
      const categoryId = categories.find((cat) => cat.notes.some((n) => n.id === noteId))?.id;
      const updated = await notesApi.update(noteId, {
        title,
        content,
        categoryId,
      });

      const updateNote = (note: CategoryNoteItem) =>
        note.id === noteId
          ? { ...note, title: updated.title, updatedAt: updated.updatedAt }
          : note;

      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          notes: cat.notes.map(updateNote),
        })),
      );
      setUncategorizedNotes((prev) => prev.map(updateNote));
      setSelectedNote((prev) =>
        prev && prev.id === noteId
          ? { ...prev, title: updated.title, updatedAt: updated.updatedAt }
          : prev,
      );
      return updated.updatedAt;
    } catch (err) {
      console.error('노트 저장 실패:', err);
    }
  };

  const handleAddNote = async (categoryId: number) => {
    try {
      const created = await notesApi.create({
        title: '새 노트',
        content: '',
        categoryId,
      });
      const noteItem: CategoryNoteItem = {
        id: created.id,
        categoryId: created.categoryId,
        title: created.title,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      };
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId ? { ...cat, notes: [noteItem, ...cat.notes] } : cat,
        ),
      );
      setSelectedId(created.id);
      setIsTrashView(false);
      setSelectedNote(created);
      if (isMobile) setMobileView('editor');
    } catch (err) {
      console.error('노트 생성 실패:', err);
    }
  };

  const handleQuickMemo = async () => {
    try {
      const created = await notesApi.create({
        title: '새 노트',
        content: '',
      });
      const noteItem: CategoryNoteItem = {
        id: created.id,
        categoryId: created.categoryId,
        title: created.title,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      };
      setUncategorizedNotes((prev) => [noteItem, ...prev]);
      setSelectedId(created.id);
      setIsTrashView(false);
      setSelectedNote(created);
      if (isMobile) setMobileView('editor');
    } catch (err) {
      console.error('노트 생성 실패:', err);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      await notesApi.delete(noteId);

      // 삭제된 노트를 목록에서 찾아서 휴지통으로 이동
      let deletedNote: CategoryNoteItem | undefined;
      setCategories((prev) =>
        prev.map((cat) => {
          const found = cat.notes.find((n) => n.id === noteId);
          if (found) deletedNote = found;
          return { ...cat, notes: cat.notes.filter((n) => n.id !== noteId) };
        }),
      );
      setUncategorizedNotes((prev) => {
        const found = prev.find((n) => n.id === noteId);
        if (found) deletedNote = found;
        return prev.filter((n) => n.id !== noteId);
      });

      if (deletedNote) {
        setTrashNotes((prev) => [
          { ...deletedNote!, deletedAt: new Date().toISOString() },
          ...prev,
        ]);
      }

      if (selectedId === noteId) {
        setSelectedId(null);
        setSelectedNote(null);
      }
    } catch (err) {
      console.error('노트 삭제 실패:', err);
    }
  };

  const handleRestoreNote = async (noteId: number) => {
    try {
      await notesApi.restore(noteId);
      const trashNote = trashNotes.find((n) => n.id === noteId);
      setTrashNotes((prev) => prev.filter((n) => n.id !== noteId));

      if (trashNote) {
        const restoredNote = { ...trashNote, deletedAt: undefined };
        if (trashNote.categoryId) {
          setCategories((prev) =>
            prev.map((cat) =>
              cat.id === trashNote.categoryId
                ? { ...cat, notes: [restoredNote, ...cat.notes] }
                : cat
            )
          );
        } else {
          setUncategorizedNotes((prev) => [restoredNote, ...prev]);
        }
      }
    } catch (err) {
      console.error('노트 복원 실패:', err);
    }
  };

  const handlePermanentDelete = async (noteId: number) => {
    try {
      await notesApi.permanentDelete(noteId);
      setTrashNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (err) {
      console.error('영구 삭제 실패:', err);
    }
  };

  const handleOpenTrash = async () => {
    setIsTrashView(true);
    setSelectedId(null);
    setSelectedNote(null);
    setIsChatOpen(false);
    setSelectedChatId(null);
    if (isMobile) {
      setMobileView('editor');
      setSidebarOpen(false);
    }

    try {
      const data = await categoriesApi.getAll(true);
      const trashItems = data.flatMap((cat) =>
        cat.notes.map((note) => ({ ...note, categoryId: cat.id })),
      );
      setTrashNotes(trashItems);
    } catch (err) {
      console.error('휴지통 로딩 실패:', err);
    }
  };

  const handleAddCategory = async (name: string) => {
    try {
      const created = await categoriesApi.create({ name });
      setCategories((prev) => [...prev, { ...created, notes: created.notes ?? [] }]);
    } catch (err) {
      console.error('카테고리 생성 실패:', err);
    }
  };

  const handleRenameCategory = async (categoryId: number, name: string) => {
    try {
      await categoriesApi.update(categoryId, { name });
      setCategories((prev) =>
        prev.map((cat) => (cat.id === categoryId ? { ...cat, categoryName: name } : cat)),
      );
    } catch (err) {
      console.error('카테고리 이름 변경 실패:', err);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    const category = categories.find((cat) => cat.id === categoryId);
    if (!category) return;

    try {
      await categoriesApi.delete(categoryId);

      // 카테고리 내 노트들을 미분류로 이동
      if (category.notes.length > 0) {
        setUncategorizedNotes((prev) => [...category.notes, ...prev]);
      }

      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
    } catch (err) {
      console.error('카테고리 삭제 실패:', err);
    }
  };

  const handleMoveNoteToCategory = async (noteId: number, categoryId: number) => {
    // 이미 해당 카테고리에 있는 노트인지 확인
    const targetCategory = categories.find((cat) => cat.id === categoryId);
    if (targetCategory?.notes.some((n) => n.id === noteId)) return;

    try {
      // 노트 상세 정보를 먼저 가져와서 필수 필드 포함
      const noteDetail = await notesApi.getById(noteId);
      await notesApi.update(noteId, {
        title: noteDetail.title,
        content: noteDetail.content,
        categoryId,
      });

      let movedNote: CategoryNoteItem | undefined;

      // 미분류에서 찾기
      setUncategorizedNotes((prev) => {
        const found = prev.find((n) => n.id === noteId);
        if (found) movedNote = found;
        return prev.filter((n) => n.id !== noteId);
      });

      // 다른 카테고리에서 찾기 & 제거 + 대상 카테고리에 추가
      setCategories((prev) =>
        prev.map((cat) => {
          const found = cat.notes.find((n) => n.id === noteId);
          if (found) movedNote = found;
          const filtered = cat.notes.filter((n) => n.id !== noteId);
          if (cat.id === categoryId && movedNote) {
            return { ...cat, notes: [movedNote, ...filtered] };
          }
          return { ...cat, notes: filtered };
        }),
      );
    } catch (err) {
      console.error('노트 이동 실패:', err);
    }
  };

  const handleToggleChat = () => {
    if (isChatOpen) {
      setIsChatOpen(false);
      setSelectedChatId(null);
    } else {
      setIsChatOpen(true);
      if (chatRooms.length > 0) {
        setSelectedChatId(chatRooms[0].id);
      }
    }
  };

  const handleRenameChat = (chatId: string, title: string) => {
    setChatRooms((prev) => prev.map((chat) => (chat.id === chatId ? { ...chat, title } : chat)));
  };

  const handleAddChat = () => {
    const newChat: ChatRoom = {
      id: String(Date.now()),
      title: `새 채팅 ${chatRooms.length + 1}`,
      createdAt: new Date().toISOString(),
    };
    setChatRooms((prev) => [newChat, ...prev]);
    setSelectedChatId(newChat.id);
    setIsChatOpen(true);
    if (isMobile) setMobileView('chat');
  };

  const handleLastMessageUpdate = (chatId: string, message: string) => {
    setChatRooms((prev) =>
      prev.map((chat) => (chat.id === chatId ? { ...chat, lastMessage: message } : chat)),
    );
  };

  const handleModelChange = (chatId: string, modelId: string) => {
    setChatRooms((prev) => prev.map((chat) => (chat.id === chatId ? { ...chat, modelId } : chat)));
  };

  const handleSelectNote = (id: number) => {
    setSelectedId(id);
    setIsTrashView(false);
    setIsChatOpen(false);
    setSelectedChatId(null);
    if (isMobile) {
      setMobileView('editor');
      setSidebarOpen(false);
    }
  };

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    if (isMobile) {
      setMobileView('chat');
      setSidebarOpen(false);
    }
  };

  const handleMobileBack = () => {
    setMobileView('list');
  };

  // 현재 보여줄 메인 컨텐츠 결정
  const renderMainContent = (onBack?: () => void) => {
    if (isTrashView) {
      return (
        <TrashListView
          trashNotes={trashNotes}
          onRestore={handleRestoreNote}
          onPermanentDelete={handlePermanentDelete}
          onBack={onBack}
        />
      );
    }
    if (isChatOpen && selectedChat) {
      return (
        <AiChatPanel
          chatId={selectedChat.id}
          chatTitle={selectedChat.title}
          onClose={() => setSelectedChatId(null)}
          onBack={onBack}
          selectedModelId={selectedChat.modelId ?? 'dev'}
          onModelChange={(modelId) => handleModelChange(selectedChat.id, modelId)}
          onLastMessageUpdate={handleLastMessageUpdate}
        />
      );
    }
    if (isChatOpen) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 gap-3">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
            />
          </svg>
          <p className="text-sm">왼쪽 목록에서 채팅을 선택하거나 추가해주세요</p>
        </div>
      );
    }
    const noteCategory = selectedNote
      ? categories.find((cat) => cat.notes.some((n) => n.id === selectedNote.id))
      : null;
    const noteCategoryIndex = noteCategory ? categories.indexOf(noteCategory) : -1;
    const noteCategoryColor =
      noteCategoryIndex >= 0
        ? Palette.CategoryColors[noteCategoryIndex % Palette.CategoryColors.length]
        : null;

    return (
      <NoteContent
        note={selectedNote}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
        onBack={onBack}
        categoryName={noteCategory?.categoryName}
        categoryColor={noteCategoryColor}
      />
    );
  };

  const sidebarProps = {
    categories,
    selectedId,
    onSelect: handleSelectNote,
    onAddNote: handleAddNote,
    onAddCategory: handleAddCategory,
    onDeleteCategory: handleDeleteCategory,
    onRenameCategory: handleRenameCategory,
    onMoveNoteToCategory: handleMoveNoteToCategory,
    onDeleteNote: handleDeleteNote,
    onQuickMemo: handleQuickMemo,
    uncategorizedNotes,
    trashNoteCount: trashNotes.length,
    onOpenTrash: handleOpenTrash,
    isTrashActive: isTrashView,
    isChatOpen,
    onToggleChat: handleToggleChat,
    chatRooms,
    selectedChatId,
    onSelectChat: handleSelectChat,
    onAddChat: handleAddChat,
    onRenameChat: handleRenameChat,
  };

  // 모바일 사이드바 오버레이 (에디터/채팅 뷰에서 햄버거로 열 때)
  const mobileSidebarOverlay = isMobile && sidebarOpen && mobileView !== 'list' && (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)} />
      <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-gray-50 dark:bg-gray-900 shadow-xl pt-14">
        <Sidebar {...sidebarProps} forceMobile />
      </aside>
    </>
  );

  // 모바일 레이아웃
  if (isMobile) {
    return (
      <>
        {mobileSidebarOverlay}
        {mobileView === 'list' ? (
          <Sidebar {...sidebarProps} forceMobile />
        ) : mobileView === 'editor' ? (
          renderMainContent(handleMobileBack)
        ) : isChatOpen && selectedChat ? (
          <AiChatPanel
            chatId={selectedChat.id}
            chatTitle={selectedChat.title}
            onClose={() => setSelectedChatId(null)}
            onBack={handleMobileBack}
            selectedModelId={selectedChat.modelId ?? 'dev'}
            onModelChange={(modelId) => handleModelChange(selectedChat.id, modelId)}
            onLastMessageUpdate={handleLastMessageUpdate}
          />
        ) : (
          renderMainContent(handleMobileBack)
        )}
      </>
    );
  }

  // 데스크톱/태블릿 레이아웃
  return (
    <>
      <Sidebar {...sidebarProps} />
      {renderMainContent()}
    </>
  );
}
