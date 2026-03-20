import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router';
import Sidebar from '~/features/note/Sidebar';
import NoteContent from '~/features/note/NoteContent';
import TrashNoteContent from '~/features/note/TrashNoteContent';
import AiChatPanel from '~/features/ai/AiChatPanel';
import { categoriesApi } from '~/lib/api/categories';
import { notesApi } from '~/lib/api/notes';
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
  const [pendingNoteIds, setPendingNoteIds] = useState<Set<number>>(new Set());
  const [trashNotes, setTrashNotes] = useState<CategoryNoteItem[]>([]);
  const [selectedTrashNoteId, setSelectedTrashNoteId] = useState<number | null>(null);
  const [selectedTrashNote, setSelectedTrashNote] = useState<Note | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId') || '550e8400-e29b-41d4-a716-446655440000';

    categoriesApi
      .getAll(userId)
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

    notesApi.getTrash().then(setTrashNotes).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedId === null) return;
    // 아직 서버에 생성되지 않은 임시 노트는 API 호출하지 않음
    if (pendingNoteIds.has(selectedId)) return;
    notesApi
      .getById(selectedId)
      .then(setSelectedNote)
      .catch(() => setSelectedNote(null));
  }, [selectedId, pendingNoteIds]);

  // 휴지통 노트 선택 시 상세 조회
  useEffect(() => {
    if (selectedTrashNoteId === null) return;
    notesApi
      .getById(selectedTrashNoteId)
      .then(setSelectedTrashNote)
      .catch(() => setSelectedTrashNote(null));
  }, [selectedTrashNoteId]);

  const selectedChat = chatRooms.find((c) => c.id === selectedChatId) ?? null;

  const handleSaveNote = async (noteId: number, title: string, content: string) => {
    try {
      const categoryId = categories.find((cat) => cat.notes.some((n) => n.id === noteId))?.id;

      if (pendingNoteIds.has(noteId)) {
        // 아직 서버에 생성되지 않은 노트 → create API 호출
        const userId =
          localStorage.getItem('userId') || '550e8400-e29b-41d4-a716-446655440000';
        const created = await notesApi.create({
          userId,
          title,
          content,
          categoryId: categoryId,
        });
        // pending에서 제거
        setPendingNoteIds((prev) => {
          const next = new Set(prev);
          next.delete(noteId);
          return next;
        });

        const updateNote = (note: CategoryNoteItem) =>
          note.id === noteId
            ? { ...note, id: created.id, title: created.title, updatedAt: created.updatedAt }
            : note;

        if (categoryId) {
          // 카테고리 내 임시 노트를 실제 노트로 교체
          setCategories((prev) =>
            prev.map((cat) => ({
              ...cat,
              notes: cat.notes.map(updateNote),
            })),
          );
        } else {
          // 미분류 노트 교체
          setUncategorizedNotes((prev) => prev.map(updateNote));
        }
        setSelectedId(created.id);
        setSelectedNote((prev) =>
          prev && prev.id === noteId ? { ...created } : prev,
        );
      } else {
        // 기존 노트 → update API 호출
        const updated = await notesApi.update(noteId, { title, content, categoryId });

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
      }
    } catch (err) {
      console.error('노트 저장 실패:', err);
    }
  };

  const handleAddNote = (categoryId: number) => {
    const userId = localStorage.getItem('userId') || '550e8400-e29b-41d4-a716-446655440000';
    const tempId = -Date.now();
    const now = new Date().toISOString();
    const noteItem = {
      id: tempId,
      userId,
      title: '새 노트',
      createdAt: now,
      updatedAt: now,
    };
    setPendingNoteIds((prev) => new Set(prev).add(tempId));
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, notes: [noteItem, ...cat.notes] } : cat,
      ),
    );
    setSelectedId(tempId);
    setSelectedTrashNoteId(null);
    setSelectedNote({
      id: tempId,
      userId,
      title: '새 노트',
      content: '',
      createdAt: now,
      updatedAt: now,
    });
    if (isMobile) setMobileView('editor');
  };

  const handleQuickMemo = () => {
    const userId = localStorage.getItem('userId') || '550e8400-e29b-41d4-a716-446655440000';
    const tempId = -Date.now();
    const now = new Date().toISOString();
    const noteItem: CategoryNoteItem = {
      id: tempId,
      userId,
      title: '새 노트',
      createdAt: now,
      updatedAt: now,
    };
    setPendingNoteIds((prev) => new Set(prev).add(tempId));
    setUncategorizedNotes((prev) => [noteItem, ...prev]);
    setSelectedId(tempId);
    setSelectedTrashNoteId(null);
    setSelectedNote({
      id: tempId,
      userId,
      title: '새 노트',
      content: '',
      createdAt: now,
      updatedAt: now,
    });
    if (isMobile) setMobileView('editor');
  };

  const handleDeleteNote = async (noteId: number) => {
    // pending 노트는 서버 호출 없이 제거
    if (pendingNoteIds.has(noteId)) {
      setPendingNoteIds((prev) => {
        const next = new Set(prev);
        next.delete(noteId);
        return next;
      });
      setCategories((prev) =>
        prev.map((cat) => ({ ...cat, notes: cat.notes.filter((n) => n.id !== noteId) })),
      );
      setUncategorizedNotes((prev) => prev.filter((n) => n.id !== noteId));
      if (selectedId === noteId) {
        setSelectedId(null);
        setSelectedNote(null);
      }
      return;
    }

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
        setTrashNotes((prev) => [{ ...deletedNote!, deletedAt: new Date().toISOString() }, ...prev]);
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
      const restored = await notesApi.restore(noteId);
      setTrashNotes((prev) => prev.filter((n) => n.id !== noteId));
      setSelectedTrashNoteId(null);
      setSelectedTrashNote(null);

      // 복원된 노트를 미분류에 추가 (원래 카테고리 정보가 없으므로)
      setUncategorizedNotes((prev) => [
        {
          id: restored.id,
          userId: restored.userId,
          title: restored.title,
          createdAt: restored.createdAt,
          updatedAt: restored.updatedAt,
        },
        ...prev,
      ]);
    } catch (err) {
      console.error('노트 복원 실패:', err);
    }
  };

  const handlePermanentDelete = async (noteId: number) => {
    try {
      await notesApi.permanentDelete(noteId);
      setTrashNotes((prev) => prev.filter((n) => n.id !== noteId));
      if (selectedTrashNoteId === noteId) {
        setSelectedTrashNoteId(null);
        setSelectedTrashNote(null);
      }
    } catch (err) {
      console.error('영구 삭제 실패:', err);
    }
  };

  const handleSelectTrashNote = (noteId: number) => {
    setSelectedTrashNoteId(noteId);
    setSelectedId(null);
    setSelectedNote(null);
    if (isMobile) {
      setMobileView('editor');
      setSidebarOpen(false);
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

  const handleAddChat = (categoryId: number) => {
    const categoryChats = chatRooms.filter((c) => c.categoryId === categoryId);
    if (categoryChats.length >= 5) return;

    const newChat: ChatRoom = {
      id: String(Date.now()),
      title: `새 채팅 ${categoryChats.length + 1}`,
      categoryId,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setChatRooms((prev) => [newChat, ...prev]);
    setSelectedChatId(newChat.id);
    if (isMobile) setMobileView('chat');
  };

  const handleSelectNote = (id: number) => {
    // 편집하지 않은 빈 새 노트는 목록에서 제거
    if (selectedId !== null && selectedId !== id && pendingNoteIds.has(selectedId)) {
      const pendingId = selectedId;
      setPendingNoteIds((prev) => {
        const next = new Set(prev);
        next.delete(pendingId);
        return next;
      });
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          notes: cat.notes.filter((n) => n.id !== pendingId),
        })),
      );
      setUncategorizedNotes((prev) => prev.filter((n) => n.id !== pendingId));
    }
    setSelectedId(id);
    setSelectedTrashNoteId(null);
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
    if (selectedTrashNoteId !== null) {
      return (
        <TrashNoteContent
          note={selectedTrashNote}
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
    return (
      <NoteContent
        note={selectedNote}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
        onBack={onBack}
        isPending={selectedNote ? pendingNoteIds.has(selectedNote.id) : false}
      />
    );
  };

  const sidebarProps = {
    categories,
    selectedId,
    onSelect: handleSelectNote,
    onAddNote: handleAddNote,
    onAddCategory: handleAddCategory,
    onDeleteNote: handleDeleteNote,
    onQuickMemo: handleQuickMemo,
    uncategorizedNotes,
    trashNotes,
    onSelectTrashNote: handleSelectTrashNote,
    selectedTrashNoteId,
    pendingNoteIds,
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
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={() => setSidebarOpen(false)}
      />
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
